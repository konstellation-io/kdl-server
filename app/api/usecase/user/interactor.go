package user

import (
	"context"
	"errors"

	"github.com/konstellation-io/kdl-server/app/api/pkg/giteaclient"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/pkg/clock"
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
}

// NewInteractor factory function.
func NewInteractor(
	logger logging.Logger,
	repo Repository,
	sshGenerator sshhelper.SSHKeyGenerator,
	c clock.Clock,
	giteaClient giteaclient.GiteaClient,
) *Interactor {
	return &Interactor{logger: logger, repo: repo, sshGenerator: sshGenerator, clock: c, giteaClient: giteaClient}
}

// Create generates a new SSH key and create the user into Gitea. It also stores the user ssh key into the DB.
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

	return i.repo.Get(ctx, insertedID)
}
