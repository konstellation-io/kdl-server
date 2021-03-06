package user

import (
	"context"
	"errors"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/giteaservice"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/k8s"
	"github.com/konstellation-io/kdl-server/app/api/pkg/clock"
	"github.com/konstellation-io/kdl-server/app/api/pkg/cron"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
	"github.com/konstellation-io/kdl-server/app/api/pkg/sshhelper"
)

var (
	ErrStartUserTools  = errors.New("cannot start running user tools")
	ErrStopUserTools   = errors.New("cannot stop uninitialized user tools")
	ErrUserToolsActive = errors.New("it is not possible to regenerate SSH keys with the usertools active")
)

type interactor struct {
	logger       logging.Logger
	repo         Repository
	sshGenerator sshhelper.SSHKeyGenerator
	clock        clock.Clock
	giteaService giteaservice.GiteaClient
	k8sClient    k8s.K8sClient
	scheduler    cron.Scheduler
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
		scheduler:    cron.NewScheduler(logger),
	}
}

// Create add a new user to the server.
// - If the user already exists (email and username must be unique) returns entity.ErrDuplicatedUser.
// - Generates a new SSH public/private keys.
// - Adds the public SSH key to the user in Gitea.
// - Stores the user and ssh keys into the DB.
// - Creates a new secret in Kubernetes with the generated SSH keys.
func (i *interactor) Create(ctx context.Context, email, username string, accessLevel entity.AccessLevel) (entity.User, error) {
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

	err = i.k8sClient.CreateUserSSHKeySecret(ctx, user, keys.Public, keys.Private)
	if err != nil {
		return entity.User{}, err
	}

	return i.repo.Get(ctx, insertedID)
}

// FindAll returns all users existing in the server.
func (i *interactor) FindAll(ctx context.Context) ([]entity.User, error) {
	i.logger.Info("Finding all users in the server")
	return i.repo.FindAll(ctx, false)
}

// GetByUsername returns the user with the desired username or returns entity.ErrUserNotFound if the user doesn't exist.
func (i *interactor) GetByUsername(ctx context.Context, username string) (entity.User, error) {
	i.logger.Infof("Getting user by username \"%s\"", username)
	return i.repo.GetByUsername(ctx, username)
}

// StartTools creates a user-tools CustomResource in K8s to initialize the VSCode and Jupyter for the given username.
func (i *interactor) StartTools(ctx context.Context, username string) (entity.User, error) {
	user, err := i.repo.GetByUsername(ctx, username)
	if err != nil {
		return entity.User{}, err
	}

	running, err := i.k8sClient.IsUserToolPODRunning(ctx, username)

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

	running, err := i.k8sClient.IsUserToolPODRunning(ctx, username)

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
func (i *interactor) AreToolsRunning(ctx context.Context, username string) (bool, error) {
	return i.k8sClient.IsUserToolPODRunning(ctx, username)
}

// FindByIDs retrieves the users for the given identifiers.
func (i *interactor) FindByIDs(ctx context.Context, userIDs []string) ([]entity.User, error) {
	return i.repo.FindByIDs(ctx, userIDs)
}

// GetByID retrieve the user for the given identifier.
func (i *interactor) GetByID(ctx context.Context, userID string) (entity.User, error) {
	return i.repo.Get(ctx, userID)
}

// UpdateAccessLevel update access level for the given identifiers.
func (i *interactor) UpdateAccessLevel(ctx context.Context, userIDs []string, level entity.AccessLevel) ([]entity.User, error) {
	// Update user permissions in Gitea
	users, err := i.FindByIDs(ctx, userIDs)
	if err != nil {
		return nil, err
	}

	for _, user := range users {
		err := i.giteaService.UpdateUserPermissions(user.Username, user.Email, level)
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
// - Check if userTools are Running. (if yes, returns ErrUserNotFound error
// - Generate a new ssh key pair
// - Check if k8s secret exists. If yes, update it. Else, create it.
// - Update public key on Gitea
// - Update ssh keys for user in database.
func (i *interactor) RegenerateSSHKeys(ctx context.Context, user entity.User) (entity.User, error) {
	i.logger.Infof("Regenerating user SSH keys for user \"%s\" ", user.Username)

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

	i.logger.Infof("The SSH keys for user \"%s\" has been successfully regenerated", user.Username)

	return i.repo.GetByUsername(ctx, user.Username)
}

// CreateAdminUser creates the KDL admin user if not exists.
func (i *interactor) CreateAdminUser(username, email string) error {
	ctx := context.Background()

	_, err := i.repo.GetByUsername(ctx, username)
	if err == nil {
		i.logger.Debugf("The admin user \"%s\" already exists", username)
		return nil
	}

	if !errors.Is(err, entity.ErrUserNotFound) {
		return err
	}

	i.logger.Debugf("Creating the admin user \"%s\"...", username)

	user, err := i.Create(ctx, email, username, entity.AccessLevelAdmin)
	if err != nil {
		return err
	}

	i.logger.Debugf("Admin user \"%s\" (%s) created correctly with id \"%s\"", user.Username, user.Email, user.ID)

	return nil
}
