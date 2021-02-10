package user

import (
	"context"
	"errors"
	"fmt"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/pkg/clock"
	"github.com/konstellation-io/kdl-server/app/api/pkg/giteaclient"
	"github.com/konstellation-io/kdl-server/app/api/pkg/k8s"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
	"github.com/konstellation-io/kdl-server/app/api/pkg/sshhelper"
)

// Interactor object implements the UseCase interface.
type Interactor struct {
	logger       logging.Logger
	repo         Repository
	sshGenerator sshhelper.SSHKeyGenerator
	clock        clock.Clock
	giteaClient  giteaclient.GiteaClient
	k8sClient    k8s.K8sClient
}

// NewInteractor factory function.
func NewInteractor(
	logger logging.Logger,
	repo Repository,
	sshGenerator sshhelper.SSHKeyGenerator,
	c clock.Clock,
	giteaClient giteaclient.GiteaClient,
	k8sClient k8s.K8sClient,
) *Interactor {
	return &Interactor{
		logger:       logger,
		repo:         repo,
		sshGenerator: sshGenerator,
		clock:        c,
		giteaClient:  giteaClient,
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
func (i Interactor) Create(ctx context.Context, email, username, password string, accessLevel entity.AccessLevel) (entity.User, error) {
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

	// Create the user in Gitea and upload their SSH keys
	err = i.giteaClient.CreateUser(email, username, password)
	if err != nil {
		return entity.User{}, err
	}

	err = i.giteaClient.AddSSHKey(username, keys.Public)
	if err != nil {
		return entity.User{}, err
	}

	// Store the user into the DB
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

	secretName := fmt.Sprintf("%s-ssh-keys", user.Username)
	err = i.k8sClient.CreateSecret(secretName, map[string]string{
		"KDL_USER_PUBLIC_SSH_KEY":  keys.Public,
		"KDL_USER_PRIVATE_SSH_KEY": keys.Private,
	})

	if err != nil {
		return entity.User{}, err
	}

	return i.repo.Get(ctx, insertedID)
}
