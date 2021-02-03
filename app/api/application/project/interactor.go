package project

import (
	"context"
	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/logging"
)

type Interactor struct {
	logger logging.Logger
	repo   Repository
}

func NewInteractor(logger logging.Logger, repo Repository) *Interactor {
	return &Interactor{logger: logger, repo: repo}
}

func (i Interactor) Create(ctx context.Context, project entity.Project) (entity.Project, error) {
	insertedProject := entity.Project{}
	insertedID, err := i.repo.Create(ctx, project)
	if err != nil {
		return insertedProject, err
	}
	i.logger.Infof("Created a new project \"%s\" with ID \"%s\"", project.Name, insertedID)
	return i.repo.Get(ctx, insertedID)
}
