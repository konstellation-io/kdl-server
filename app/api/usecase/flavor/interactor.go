package flavor

import (
	"context"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/k8s"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
	"github.com/konstellation-io/kdl-server/app/api/usecase/project"
)

type interactor struct {
	logger      logging.Logger
	k8sClient   k8s.K8sClient
	repo        Repository
	projectRepo project.Repository
}

// NewInteractor factory function.
func NewInteractor(
	logger logging.Logger,
	k8sClient k8s.K8sClient,
	repo Repository,
	projectRepo project.Repository,
) UseCase {
	return &interactor{
		logger:      logger,
		k8sClient:   k8sClient,
		repo:        repo,
		projectRepo: projectRepo,
	}
}

// GetProjectFlavors retrieve all flavors related with the project.
func (i interactor) GetProjectFlavors(ctx context.Context, projectId string) ([]entity.Flavor, error) {
	// get generic project flavors
	genericFlavors, err := i.repo.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	// get project specific flavors
	pr, err := i.projectRepo.Get(ctx, projectId)
	if err != nil {
		return nil, err
	}

	return append(genericFlavors, pr.Flavors...), nil
}

func (i interactor) GetRunningFlavor(ctx context.Context, username string) ([]entity.Flavor, error) {
	podImage, err := i.k8sClient.GetRunningRuntimePODFlavor(ctx, username)
	if err != nil {
		return nil, err
	}
	i.logger.Infof("Flavor POD image " + podImage)

	return nil, nil
}
