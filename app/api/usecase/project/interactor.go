package project

import (
	"context"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/giteaservice"
	"github.com/konstellation-io/kdl-server/app/api/pkg/clock"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
)

// Interactor implements the UseCase interface.
type Interactor struct {
	logger       logging.Logger
	repo         Repository
	clock        clock.Clock
	giteaService giteaservice.GiteaClient
}

// NewInteractor is a constructor function.
func NewInteractor(logger logging.Logger, repo Repository, c clock.Clock, giteaService giteaservice.GiteaClient) *Interactor {
	return &Interactor{logger: logger, repo: repo, clock: c, giteaService: giteaService}
}

// Create stores into the DB a new project.
func (i Interactor) Create(ctx context.Context, name, description string) (entity.Project, error) {
	err := i.giteaService.CreateRepo(name, description)
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

// Find all projects existing in the server.
func (i Interactor) FindAll(ctx context.Context) ([]entity.Project, error) {
	i.logger.Info("Finding all projects in the server")
	return i.repo.FindAll(ctx)
}
