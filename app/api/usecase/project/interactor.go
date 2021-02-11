package project

import (
	"context"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/pkg/clock"
	"github.com/konstellation-io/kdl-server/app/api/pkg/giteaclient"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
)

// Interactor implements the UseCase interface.
type Interactor struct {
	logger      logging.Logger
	repo        Repository
	clock       clock.Clock
	giteaClient giteaclient.GiteaClient
}

// NewInteractor is a constructor function.
func NewInteractor(logger logging.Logger, repo Repository, c clock.Clock, giteaClient giteaclient.GiteaClient) *Interactor {
	return &Interactor{logger: logger, repo: repo, clock: c, giteaClient: giteaClient}
}

// Create stores into the DB a new project.
func (i Interactor) Create(ctx context.Context, name, description string) (entity.Project, error) {
	err := i.giteaClient.CreateRepo(name, description)
	if err != nil {
		return entity.Project{}, err
	}

	project := entity.NewProject(name, description)
	project.CreationDate = i.clock.Now()

	insertedID, err := i.repo.Create(ctx, project)
	if err != nil {
		return entity.Project{}, err
	}

	i.logger.Infof("Created a new project \"%s\" with ID \"%s\"", project.Name, insertedID)

	return i.repo.Get(ctx, insertedID)
}
