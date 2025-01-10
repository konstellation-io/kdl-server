package user

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/go-logr/logr"
	"github.com/gosimple/slug"
	k8errors "k8s.io/apimachinery/pkg/api/errors"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/config"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/k8s"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/minioadminservice"
	"github.com/konstellation-io/kdl-server/app/api/pkg/clock"
	"github.com/konstellation-io/kdl-server/app/api/pkg/kdlutil"
	"github.com/konstellation-io/kdl-server/app/api/pkg/sshhelper"
	"github.com/konstellation-io/kdl-server/app/api/usecase/capabilities"
	"github.com/konstellation-io/kdl-server/app/api/usecase/runtime"
)

var (
	ErrStopUserTools   = errors.New("cannot stop uninitialized user tools")
	ErrUserToolsActive = errors.New("it is not possible to regenerate SSH keys with the usertools active")
)

type Interactor struct {
	logger            logr.Logger
	cfg               config.Config
	repo              Repository
	repoRuntimes      runtime.Repository
	repoCapabilities  capabilities.Repository
	sshGenerator      sshhelper.SSHKeyGenerator
	clock             clock.Clock
	k8sClient         k8s.ClientInterface
	minioAdminService minioadminservice.MinioAdminInterface
	randomGenerator   kdlutil.RandomGenerator
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
	k8sClient k8s.ClientInterface,
	minioAdminService minioadminservice.MinioAdminInterface,
	randomGenerator kdlutil.RandomGenerator,
) UseCase {
	return &Interactor{
		logger:            logger,
		cfg:               cfg,
		repo:              repo,
		repoRuntimes:      repoRuntimes,
		repoCapabilities:  repoCapabilities,
		sshGenerator:      sshGenerator,
		clock:             c,
		k8sClient:         k8sClient,
		minioAdminService: minioAdminService,
		randomGenerator:   randomGenerator,
	}
}

// Create add a new user to the server.
// - If the user already exists (email, username and sub must be unique) returns entity.ErrDuplicatedUser.
// - Generates a new SSH public/private keys.
// - Stores the user and ssh keys into the DB.
// - Creates a new secret in Kubernetes with the generated SSH keys.
// - Created a service account for the user.
func (i *Interactor) Create(ctx context.Context, email, sub string, accessLevel entity.AccessLevel) (entity.User, error) {
	// extract username from email
	username := kdlutil.GetUsernameFromEmail(email)

	fmt.Println("Creating user", "username", username, "email", email)
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

	_, err = i.repo.GetBySub(ctx, sub)
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
		Sub:          sub,
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

	user.MinioAccessKey.SecretKey, err = i.randomGenerator.GenerateRandomString(40)
	if err != nil {
		i.logger.Error(err, "Error creating an MinIO secret key", "username", username)
		return entity.User{}, err
	}

	user.MinioAccessKey.AccessKey = fmt.Sprintf("user-%s", user.UsernameSlug())

	err = i.minioAdminService.CreateUser(ctx, user.MinioAccessKey.AccessKey, user.MinioAccessKey.SecretKey)
	if err != nil {
		i.logger.Error(err, "Error creating  an MinIO user", "accessKey", user.MinioAccessKey.AccessKey)
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

// StartTools creates a user-tools CustomResource in K8s to initialize the VSCode for the given email.
// If there are already a user-tools for the user, they are replaced (stop + start new).
func (i *Interactor) StartTools(ctx context.Context, email string, runtimeID, capabilitiesID *string) (entity.User, error) {
	user, err := i.repo.GetByEmail(ctx, email)
	if err != nil {
		return entity.User{}, err
	}

	running, err := i.AreToolsRunning(ctx, user.Username)

	if err != nil {
		return entity.User{}, err
	}

	if running {
		// ignore the user returned by the stop, as it the same as we already have
		_, err := i.StopTools(ctx, email)
		if err != nil {
			return entity.User{}, err
		}
	}

	var data = k8s.UserToolsData{}

	if runtimeID != nil {
		r, err := i.repoRuntimes.Get(ctx, *runtimeID)
		if err != nil {
			return entity.User{}, err
		}

		data.RuntimeID = r.ID
		data.RuntimeImage = r.DockerImage
		data.RuntimeTag = r.DockerTag
		i.logger.Info("Runtime with docker image", "runtimeId", r.ID, "image", r.DockerImage, "tag", r.DockerTag)
	} else {
		i.logger.Info("No runtime ID provided, using default runtime values")
	}

	if capabilitiesID != nil {
		data.Capabilities, err = i.repoCapabilities.Get(ctx, *capabilitiesID)
		if err != nil {
			return entity.User{}, err
		}
	} else {
		i.logger.Info("No capabilities ID provided, using default capabilities values")
	}

	i.logger.Info("Creating user tools for user", "email", email)

	err = i.k8sClient.CreateKDLUserToolsCR(ctx, user.Username, data)
	if err != nil {
		return entity.User{}, err
	}

	return user, nil
}

// StopTools removes a created user-tools CustomResource from K8s for the given email.
func (i *Interactor) StopTools(ctx context.Context, email string) (entity.User, error) {
	user, err := i.repo.GetByEmail(ctx, email)
	if err != nil {
		return entity.User{}, err
	}

	running, err := i.AreToolsRunning(ctx, user.Username)

	if err != nil {
		return entity.User{}, err
	}

	if !running {
		return entity.User{}, ErrStopUserTools
	}

	i.logger.Info("Deleting user tools for user", "username", user.Username)

	err = i.k8sClient.DeleteUserToolsCR(ctx, user.Username)
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
	return i.cfg.Kubeconfig.Enabled
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
	// Update access level in our DataBase
	if err := i.repo.UpdateAccessLevel(ctx, userIDs, level); err != nil {
		return nil, err
	}

	return i.repo.FindByIDs(ctx, userIDs)
}

// UpdateSub updates the sub for the given user.
func (i *Interactor) UpdateSub(ctx context.Context, user entity.User, sub string) (entity.User, error) {
	i.logger.Info("Updating user sub", "username", user.Username, "sub", sub)

	if _, err := i.repo.GetBySub(ctx, sub); err == nil {
		return entity.User{}, entity.ErrDuplicatedUser
	}

	if err := i.repo.UpdateSub(ctx, user.Username, sub); err != nil {
		return entity.User{}, err
	}

	return i.repo.GetByUsername(ctx, user.Username)
}

// RegenerateSSHKeys generate new SSH key pair for the given user.
// - Check if user exists. (if no, returns ErrUserNotFound error)
// - Check if userTools are Running. (if yes, returns ErrUserNotFound error)
// - Generate a new ssh key pair
// - Check if k8s secret exists. If yes, update it. Else, create it.
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

// Get the CRD template from the ConfigMap and update all the KDL UserTools in the namespace.
func (i *Interactor) UpdateKDLUserTools(ctx context.Context) error {
	configMap, err := i.k8sClient.GetConfigMap(ctx, i.k8sClient.GetConfigMapTemplateNameKDLUserTools())
	if err != nil {
		return err
	}

	// get the CRD template converted from yaml to go object from the ConfigMap
	crd, err := kdlutil.GetCrdTemplateFromConfigMap(configMap)
	if err != nil {
		return err
	}

	// get all the KDL UserTools in the namespace and iterate over to update them
	kdlUserTools, err := i.k8sClient.ListKDLUserToolsCR(ctx)
	if err != nil {
		return err
	}

	for _, userTool := range kdlUserTools {
		resourceName := userTool.GetName()

		spec, ok := userTool.Object["spec"].(map[string]interface{})
		if !ok {
			i.logger.Info("Error getting spec from KDL UserTools CR", "userToolName", userTool.GetName())
			continue
		}

		podLabels, ok := spec["podLabels"].(map[string]interface{})
		if !ok {
			i.logger.Info("Error getting spec.podLabels from KDL UserTools CR", "userToolName", userTool.GetName())
			continue
		}

		runtimeID, ok := podLabels["runtimeId"].(string)
		if !ok || runtimeID == "" {
			i.logger.Info("Runtime ID provided is not valid, skipping user tools update", "userToolName", resourceName)
			continue
		}

		capabilitiesID, ok := podLabels["capabilityId"].(string)
		if !ok || capabilitiesID == "" {
			i.logger.Info("Capability ID provided is not valid, skipping user tools update", "userToolName", resourceName)
			continue
		}

		r, err := i.repoRuntimes.Get(ctx, runtimeID)
		if err != nil {
			i.logger.Error(err, "Error getting runtime", "runtimeID", runtimeID)
			continue
		}

		var data = k8s.UserToolsData{}
		data.RuntimeID = r.ID
		data.RuntimeImage = r.DockerImage
		data.RuntimeTag = r.DockerTag

		data.Capabilities, err = i.repoCapabilities.Get(ctx, capabilitiesID)
		if err != nil {
			i.logger.Error(err, "Error getting capability", "capabilitiesID", capabilitiesID)
			continue
		}

		err = i.k8sClient.UpdateKDLUserToolsCR(ctx, resourceName, data, &crd)
		if err != nil {
			i.logger.Error(err, "Error updating KDL UserTools CR in k8s", "userToolName", resourceName)
		}
	}

	return nil
}
