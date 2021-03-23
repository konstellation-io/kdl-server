package user

import (
	"context"
	"errors"
	"fmt"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/giteaservice"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/k8s"
	"github.com/konstellation-io/kdl-server/app/api/pkg/clock"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
	"github.com/konstellation-io/kdl-server/app/api/pkg/sshhelper"
)

var (
	ErrStartUserTools = errors.New("cannot start running user tools")
	ErrStopUserTools  = errors.New("cannot stop uninitialized user tools")
)

type interactor struct {
	logger       logging.Logger
	repo         Repository
	sshGenerator sshhelper.SSHKeyGenerator
	clock        clock.Clock
	giteaService giteaservice.GiteaClient
	k8sClient    k8s.K8sClient
}

// NewInteractor factory function.
func NewInteractor(
	logger logging.Logger,
	repo Repository,
	sshGenerator sshhelper.SSHKeyGenerator,
	c clock.Clock,
	giteaService giteaservice.GiteaClient,
	k8sClient k8s.K8sClient,
) UseCase {
	return &interactor{
		logger:       logger,
		repo:         repo,
		sshGenerator: sshGenerator,
		clock:        c,
		giteaService: giteaService,
		k8sClient:    k8sClient,
	}
}

// Create add a new user to the server.
// - If the user already exists (email and username must be unique) returns entity.ErrDuplicatedUser.
// - Generates a new SSH public/private keys.
// - Creates the user into Gitea.
// - Adds the public SSH key to the user in Gitea.
// - Stores the user and ssh keys into the DB.
// - Creates a new secret in Kubernetes with the generated SSH keys.
func (i *interactor) Create(ctx context.Context, email, username, password string, accessLevel entity.AccessLevel) (entity.User, error) {
	i.logger.Infof("Creating user \"%s\" with email \"%s\"", username, email)

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
		return entity.User{}, err
	}

	// Creates the user into Gitea.
	err = i.giteaService.CreateUser(email, username, password)
	if err != nil {
		return entity.User{}, err
	}

	// Adds the public SSH key to the user in Gitea.
	err = i.giteaService.AddSSHKey(username, keys.Public)
	if err != nil {
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
		return entity.User{}, err
	}

	i.logger.Infof("The user \"%s\" (%s) was created with ID \"%s\"", user.Username, user.Email, insertedID)

	secretName := fmt.Sprintf("%s-ssh-keys", user.UsernameSlug())
	err = i.k8sClient.CreateSecret(secretName, map[string]string{
		"KDL_USER_PUBLIC_SSH_KEY":  keys.Public,
		"KDL_USER_PRIVATE_SSH_KEY": keys.Private,
	})

	if err != nil {
		return entity.User{}, err
	}

	return i.repo.Get(ctx, insertedID)
}

// FindAll returns all users existing in the server.
func (i *interactor) FindAll(ctx context.Context) ([]entity.User, error) {
	i.logger.Info("Finding all users in the server")
	return i.repo.FindAll(ctx)
}

// GetByEmail returns the user with the desired email or returns entity.ErrUserNotFound if the user doesn't exist.
func (i *interactor) GetByEmail(ctx context.Context, email string) (entity.User, error) {
	i.logger.Infof("Getting user by email \"%s\"", email)
	return i.repo.GetByEmail(ctx, email)
}

// StartTools creates a user-tools CustomResource in K8s to initialize the VSCode and Jupyter for the given username.
func (i *interactor) StartTools(ctx context.Context, username string) (entity.User, error) {
	user, err := i.repo.GetByUsername(ctx, username)
	if err != nil {
		return entity.User{}, err
	}

	running, err := i.k8sClient.IsUserToolPODRunning(username)

	if err != nil {
		return entity.User{}, err
	}

	if running {
		return entity.User{}, ErrStartUserTools
	}

	i.logger.Infof("Creating user tools for user: \"%s\"", username)

	err = i.k8sClient.CreateUserToolsCR(ctx, username)
	if err != nil {
		return entity.User{}, err
	}

	return user, nil
}

// StopTools removes a created user-tools CustomResource from K8s for the given username.
func (i *interactor) StopTools(ctx context.Context, username string) (entity.User, error) {
	user, err := i.repo.GetByUsername(ctx, username)
	if err != nil {
		return entity.User{}, err
	}

	running, err := i.k8sClient.IsUserToolPODRunning(username)

	if err != nil {
		return entity.User{}, err
	}

	if !running {
		return entity.User{}, ErrStopUserTools
	}

	i.logger.Infof("Deleting user tools for user: \"%s\"", username)

	err = i.k8sClient.DeleteUserToolsCR(ctx, username)
	if err != nil {
		return entity.User{}, err
	}

	return user, nil
}

// AreToolsRunning checks if the user tools are running for the given username.
func (i *interactor) AreToolsRunning(username string) (bool, error) {
	return i.k8sClient.IsUserToolPODRunning(username)
}

// FindByIDs retrieves the users for the given identifiers.
func (i *interactor) FindByIDs(ctx context.Context, userIDs []string) ([]entity.User, error) {
	return i.repo.FindByIDs(ctx, userIDs)
}

// GetByID retrieve the user for the given identifier.
func (i *interactor) GetByID(ctx context.Context, userID string) (entity.User, error) {
	return i.repo.Get(ctx, userID)
}

// RegenerateSSHKeys generate new SSH key pair for the given user.
// - Check if user exists, or return ErrUserNotFound error
// - Generate a new ssh key pair
// - Check if k8s secret exists. If yes, update it. Else, create it.
// - Check if one ssh key exist for user in gitea. If more than one, returns error.
//   If one, delete it and  create a new one. If not exist, create a new one.
// - Update ssh keys for user in database.
func (i *interactor) RegenerateSSHKeys(ctx context.Context, username string) (entity.User, error) {
	i.logger.Infof("Regenerating user SSH keys for user \"%s\" ", username)

	// Check if the user exists
	user, err := i.repo.GetByUsername(ctx, username)
	if err != nil {
		return entity.User{}, entity.ErrUserNotFound
	}

	// Create new SSH public and private keys
	keys, err := i.sshGenerator.NewKeys()
	if err != nil {
		return entity.User{}, err
	}

	// Check if k8s secret exists. If exists, update it. Otherwise, create it.
	secretName := fmt.Sprintf("%s-ssh-keys", user.UsernameSlug())

	k8sKeys := map[string]string{
		"KDL_USER_PUBLIC_SSH_KEY":  keys.Public,
		"KDL_USER_PRIVATE_SSH_KEY": keys.Private,
	}

	err = i.k8sClient.UpdateSecret(secretName, k8sKeys)

	if err != nil {
		return entity.User{}, err
	}

	// Check if user ssh key exists in gitea. If exists, update it. Otherwise, create it
	giteaPublicKey, err := i.giteaService.GetUserSSHKey(username)

	if err != nil {
		if !errors.Is(err, entity.ErrNoKdlSSHKeyFound) {
			return entity.User{}, err
		}

		err = i.giteaService.AddSSHKey(username, keys.Public)
	} else {
		err = i.giteaService.UpdateSSHKey(username, giteaPublicKey, keys.Public)
	}

	if err != nil {
		return entity.User{}, err
	}

	// Update the user ssh keys in the DB.
	user = entity.User{
		Username: username,
		SSHKey:   keys,
	}

	err = i.repo.UpdateSSHKey(ctx, username, keys)
	if err != nil {
		return entity.User{}, err
	}

	i.logger.Infof("The SSH keys for user \"%s\" has been successfully regenerated", user.Username)

	return i.repo.GetByUsername(ctx, username)
}
