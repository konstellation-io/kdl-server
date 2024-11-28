package user

import (
	"context"
	"errors"
	"strings"

	"github.com/go-logr/logr"
	"github.com/gosimple/slug"
	k8errors "k8s.io/apimachinery/pkg/api/errors"

	"github.com/konstellation-io/kdl-server/app/api/infrastructure/config"
	"github.com/konstellation-io/kdl-server/app/api/usecase/capabilities"
	"github.com/konstellation-io/kdl-server/app/api/usecase/runtime"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/giteaservice"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/k8s"
	"github.com/konstellation-io/kdl-server/app/api/pkg/clock"
	"github.com/konstellation-io/kdl-server/app/api/pkg/sshhelper"
)

var (
	ErrStopUserTools   = errors.New("cannot stop uninitialized user tools")
	ErrUserToolsActive = errors.New("it is not possible to regenerate SSH keys with the usertools active")
)

type Interactor struct {
	logger           logr.Logger
	cfg              config.Config
	repo             Repository
	repoRuntimes     runtime.Repository
	repoCapabilities capabilities.Repository
	sshGenerator     sshhelper.SSHKeyGenerator
	clock            clock.Clock
	giteaService     giteaservice.GiteaClient
	k8sClient        k8s.ClientInterface
}

// Interactor implements the UseCase interface.
var _ UseCase = (*Interactor)(nil)

// NewInteractor factory function.
func NewInteractor(
	logger logr.Logger,
	cfg config.Config,
	repo Repository,
	repoRuntimes runtime.Repository,
	repoCapabilities capabilities.Repository,
	sshGenerator sshhelper.SSHKeyGenerator,
	c clock.Clock,
	giteaService giteaservice.GiteaClient,
	k8sClient k8s.ClientInterface,
) UseCase {
	return &Interactor{
		logger:           logger,
		cfg:              cfg,
		repo:             repo,
		repoRuntimes:     repoRuntimes,
		repoCapabilities: repoCapabilities,
		sshGenerator:     sshGenerator,
		clock:            c,
		giteaService:     giteaService,
		k8sClient:        k8sClient,
	}
}

// Create add a new user to the server.
// - If the user already exists (email and username must be unique) returns entity.ErrDuplicatedUser.
// - Generates a new SSH public/private keys.
// - Adds the public SSH key to the user in Gitea.
// - Stores the user and ssh keys into the DB.
// - Creates a new secret in Kubernetes with the generated SSH keys.
// - Created a service account for the user.
func (i *Interactor) Create(ctx context.Context, email, username string, accessLevel entity.AccessLevel) (entity.User, error) {
	i.logger.Info("Creating user", "username", username, "email", email)

	// Check if the user already exists
	_, err := i.repo.GetByUsername(ctx, username)
	if err == nil {
		return entity.User{}, entity.ErrDuplicatedUser
	}

	if !errors.Is(err, entity.ErrUserNotFound) {
		return entity.User{}, err
	}

	_, err = i.repo.GetByEmail(ctx, email)
	if err == nil {
		return entity.User{}, entity.ErrDuplicatedUser
	}

	if !errors.Is(err, entity.ErrUserNotFound) {
		return entity.User{}, err
	}

	// Create SSH public and private keys
	keys, err := i.sshGenerator.NewKeys()
	if err != nil {
		i.logger.Error(err, "Error generating keys for user", "username", username)
		return entity.User{}, err
	}

	// Stores the user and ssh keys into the DB.
	user := entity.User{
		Username:     username,
		Email:        email,
		AccessLevel:  accessLevel,
		CreationDate: i.clock.Now(),
		SSHKey:       keys,
	}

	insertedID, err := i.repo.Create(ctx, user)
	if err != nil {
		i.logger.Error(err, "Error creating user", "username", username, "email", email)
		return entity.User{}, err
	}

	i.logger.Info("The user was created", "username", user.Username, "userEmail", user.Email, "insertedID", insertedID)

	err = i.k8sClient.CreateUserSSHKeySecret(ctx, user, keys.Public, keys.Private)
	if err != nil {
		i.logger.Error(err, "Error creating ssh key secret", "username", username)
		return entity.User{}, err
	}

	// Created a service account for the user
	_, err = i.k8sClient.CreateUserServiceAccount(ctx, user.UsernameSlug())
	if err != nil {
		i.logger.Error(err, "Error creating service account", "username", username)
		return entity.User{}, err
	}

	return i.repo.Get(ctx, insertedID)
}

// FindAll returns all users existing in the server.
func (i *Interactor) FindAll(ctx context.Context) ([]entity.User, error) {
	i.logger.Info("Finding all users in the server")
	return i.repo.FindAll(ctx, false)
}

// GetByEmail returns the user with the desired email or returns entity.ErrUserNotFound if the user doesn't exist.
func (i *Interactor) GetByEmail(ctx context.Context, email string) (entity.User, error) {
	i.logger.Info("Getting user by email", "email", email)
	return i.repo.GetByEmail(ctx, email)
}

// StartTools creates a user-tools CustomResource in K8s to initialize the VSCode for the given username.
// If there are already a user-tools for the user, they are replaced (stop + start new).
func (i *Interactor) StartTools(ctx context.Context, username string, runtimeID, capabilitiesID *string) (entity.User, error) {
	user, err := i.repo.GetByUsername(ctx, username)
	if err != nil {
		return entity.User{}, err
	}

	running, err := i.AreToolsRunning(ctx, username)

	if err != nil {
		return entity.User{}, err
	}

	if running {
		// ignore the user returned by the stop, as it the same as we already have
		_, err := i.StopTools(ctx, username)
		if err != nil {
			return entity.User{}, err
		}
	}

	var rID, rImage, rTag string

	if runtimeID != nil {
		r, err := i.repoRuntimes.Get(ctx, *runtimeID)
		if err != nil {
			return entity.User{}, err
		}

		rID = r.ID
		rImage = r.DockerImage
		rTag = r.DockerTag
		i.logger.Info("Runtime with docker image", "runtimeId", rID, "image", rImage, "tag", rTag)
	} else {
		rID = "default"
		rImage = i.cfg.UserToolsVsCodeRuntime.Image.Repository
		rTag = i.cfg.UserToolsVsCodeRuntime.Image.Tag
		i.logger.Info("Using default runtime image", "image", rImage, "tag", rTag)
	}

	retrievedCapabilities := entity.Capabilities{}
	if capabilitiesID != nil {
		retrievedCapabilities, err = i.repoCapabilities.Get(ctx, *capabilitiesID)
		if err != nil {
			return entity.User{}, err
		}
	}

	i.logger.Info("Creating user tools for user", "username", username)

	err = i.k8sClient.CreateUserToolsCR(ctx, username, rID, rImage, rTag, retrievedCapabilities)
	if err != nil {
		return entity.User{}, err
	}

	return user, nil
}

// StopTools removes a created user-tools CustomResource from K8s for the given username.
func (i *Interactor) StopTools(ctx context.Context, username string) (entity.User, error) {
	user, err := i.repo.GetByUsername(ctx, username)
	if err != nil {
		return entity.User{}, err
	}

	running, err := i.AreToolsRunning(ctx, username)

	if err != nil {
		return entity.User{}, err
	}

	if !running {
		return entity.User{}, ErrStopUserTools
	}

	i.logger.Info("Deleting user tools for user", "username", username)

	err = i.k8sClient.DeleteUserToolsCR(ctx, username)
	if err != nil {
		return entity.User{}, err
	}

	return user, nil
}

// AreToolsRunning checks if the user tools are running for the given username.
func (i *Interactor) AreToolsRunning(ctx context.Context, username string) (bool, error) {
	return i.k8sClient.IsUserToolPODRunning(ctx, username)
}

// IsKubeconfigActive checks if the kubeconfig is active.
func (i *Interactor) IsKubeconfigActive() bool {
	return i.cfg.UserToolsKubeconfig.Enabled
}

// FindByIDs retrieves the users for the given identifiers.
func (i *Interactor) FindByIDs(ctx context.Context, userIDs []string) ([]entity.User, error) {
	return i.repo.FindByIDs(ctx, userIDs)
}

// GetByID retrieve the user for the given identifier.
func (i *Interactor) GetByID(ctx context.Context, userID string) (entity.User, error) {
	return i.repo.Get(ctx, userID)
}

// UpdateAccessLevel update access level for the given identifiers.
func (i *Interactor) UpdateAccessLevel(ctx context.Context, userIDs []string, level entity.AccessLevel) ([]entity.User, error) {
	// Update user permissions in Gitea
	users, err := i.FindByIDs(ctx, userIDs)
	if err != nil {
		return nil, err
	}

	for _, user := range users {
		err := i.giteaService.UpdateUserPermissions(user.Username, level)
		if err != nil {
			return nil, err
		}
	}

	// Update access level in our DataBase
	err = i.repo.UpdateAccessLevel(ctx, userIDs, level)
	if err != nil {
		return nil, err
	}

	return i.repo.FindByIDs(ctx, userIDs)
}

// RegenerateSSHKeys generate new SSH key pair for the given user.
// - Check if user exists. (if no, returns ErrUserNotFound error)
// - Check if userTools are Running. (if yes, returns ErrUserNotFound error)
// - Generate a new ssh key pair
// - Check if k8s secret exists. If yes, update it. Else, create it.
// - Update public key on Gitea
// - Update ssh keys for user in database.
func (i *Interactor) RegenerateSSHKeys(ctx context.Context, user entity.User) (entity.User, error) {
	i.logger.Info("Regenerating user SSH keys for user", "username", user.Username)

	// Check if userTools are running
	userToolsRunning, err := i.AreToolsRunning(ctx, user.Username)
	if err != nil {
		return entity.User{}, err
	}

	if userToolsRunning {
		return entity.User{}, ErrUserToolsActive
	}

	// Create new SSH public and private keys
	keys, err := i.sshGenerator.NewKeys()
	if err != nil {
		return entity.User{}, err
	}

	// Update the user SSH keys secret in k8s.
	err = i.k8sClient.UpdateUserSSHKeySecret(ctx, user, keys.Public, keys.Private)
	if err != nil {
		return entity.User{}, err
	}

	// Update public key on Gitea
	err = i.giteaService.UpdateSSHKey(user.Username, keys.Public)
	if err != nil {
		return entity.User{}, err
	}

	// Update the user ssh keys in the DB.
	err = i.repo.UpdateSSHKey(ctx, user.Username, keys)
	if err != nil {
		return entity.User{}, err
	}

	i.logger.Info("The SSH keys for user has been successfully regenerated", "username", user.Username)

	return i.repo.GetByUsername(ctx, user.Username)
}

// SynchronizeServiceAccountsForUsers ensures all users has their serviceAccount created and delete it
// - for users that has been removed.
func (i *Interactor) SynchronizeServiceAccountsForUsers() error {
	ctx := context.Background()

	users, err := i.repo.FindAll(ctx, true)
	if err != nil {
		return err
	}

	for _, user := range users {
		if user.Deleted {
			if err := i.k8sClient.DeleteUserServiceAccount(ctx, user.UsernameSlug()); err != nil {
				i.logger.Error(err, "Error deleting user service account for user", "username", user.UsernameSlug())
			}
		} else {
			_, err = i.k8sClient.CreateUserServiceAccount(ctx, user.UsernameSlug())
			if err != nil && !k8errors.IsNotFound(err) {
				i.logger.Error(err, "Error creating user serviceAccount for user", "username", user.UsernameSlug())
			}
		}
	}

	return nil
}

// CreateAdminUser creates the KDL admin user if not exists.
func (i *Interactor) CreateAdminUser(username, email string) error {
	ctx := context.Background()

	_, err := i.repo.GetByUsername(ctx, username)
	if err == nil {
		i.logger.Info("The admin user already exists", "username", username)
		return nil
	}

	if !errors.Is(err, entity.ErrUserNotFound) {
		return err
	}

	i.logger.Info("Creating the admin user", "username", username)

	user, err := i.Create(ctx, email, username, entity.AccessLevelAdmin)
	if err != nil {
		return err
	}

	i.logger.Info("Admin user created correctly", "username", user.Username, "userEmail", user.Email, "insertedID", user.ID)

	return nil
}

// GetKubeconfig returns user kubeconfig.
func (i *Interactor) GetKubeconfig(ctx context.Context, username string) (string, error) {
	running, err := i.k8sClient.IsUserToolPODRunning(ctx, username)

	if err != nil {
		return "", err
	}

	if !running {
		return "", ErrStopUserTools
	}

	usernameSlug := slug.Make(username)

	i.logger.Info("Getting kubeconfig for user", "username", usernameSlug)

	kubeconfig, err := i.k8sClient.GetUserKubeconfig(ctx, usernameSlug)
	if err != nil {
		return "", err
	}

	kubeConfTxt := string(kubeconfig)
	kubeConfTxt = strings.TrimPrefix(kubeConfTxt, "\n")

	return kubeConfTxt, nil
}
