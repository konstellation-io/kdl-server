package flavor

import (
	"context"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
	"github.com/konstellation-io/kdl-server/app/api/usecase/project"
)

type interactor struct {
	logger      logging.Logger
	repo        Repository
	projectRepo project.Repository
}

// NewInteractor factory function.
func NewInteractor(
	logger logging.Logger,
	repo Repository,
	projectRepo project.Repository,
) UseCase {
	return &interactor{
		logger:      logger,
		repo:        repo,
		projectRepo: projectRepo,
	}
}

// GetProjectFlavors retrieve all flavors related with the project.
func (i interactor) GetProjectFlavors(ctx context.Context, id string) ([]entity.Flavor, error) {
	// get generic project flavors
	genericFlavors, err := i.repo.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	// get project specific flavors
	project, err := i.projectRepo.Get(ctx, id)
	if err != nil {
		return nil, err
	}

	return append(genericFlavors, project.Flavors...), nil
}
