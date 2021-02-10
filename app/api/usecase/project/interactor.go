package project

import (
	"context"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/pkg/clock"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
)

// Interactor implements the UseCase interface.
type Interactor struct {
	logger logging.Logger
	repo   Repository
	clock  clock.Clock
}

// NewInteractor is a constructor function.
func NewInteractor(logger logging.Logger, repo Repository, c clock.Clock) *Interactor {
	return &Interactor{logger: logger, repo: repo, clock: c}
}

// Create stores into the DB a new project.
func (i Interactor) Create(ctx context.Context, name, description string) (entity.Project, error) {
	insertedProject := entity.Project{}
	project := entity.NewProject(name, description)
	project.CreationDate = i.clock.Now()

	insertedID, err := i.repo.Create(ctx, project)
	if err != nil {
		return insertedProject, err
	}

	i.logger.Infof("Created a new project \"%s\" with ID \"%s\"", project.Name, insertedID)

	return i.repo.Get(ctx, insertedID)
}
