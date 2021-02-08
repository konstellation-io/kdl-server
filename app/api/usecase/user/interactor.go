package user

import (
	"context"
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
func NewInteractor(logger logging.Logger, repo Repository, sshGenerator sshhelper.SSHKeyGenerator, clock clock.Clock, giteaClient giteaclient.GiteaClient) *Interactor {
	return &Interactor{logger: logger, repo: repo, sshGenerator: sshGenerator, clock: clock, giteaClient: giteaClient}
}

// Create generates a new SSH key and create the user into Gitea. It also stores the user ssh key into the DB.
func (i Interactor) Create(ctx context.Context, email string, accessLevel entity.AccessLevel) (entity.User, error) {
	// Create SSH public and private keys
	keys, err := i.sshGenerator.NewKeys()
	if err != nil {
		return entity.User{}, err
	}

	err = i.giteaClient.CreateUser(email)
	if err != nil {
		return entity.User{}, err
	}

	user := entity.User{
		Email:        email,
		AccessLevel:  accessLevel,
		CreationDate: i.clock.Now(),
		SSHKey:       keys,
	}

	// Store the user into the DB
	insertedID, err := i.repo.Create(ctx, user)
	if err != nil {
		return entity.User{}, err
	}

	i.logger.Infof("Created a new user \"%s\" with ID \"%s\"", user.Email, insertedID)

	return i.repo.Get(ctx, insertedID)
}
