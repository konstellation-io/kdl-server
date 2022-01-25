package runtime

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

// GetProjectRuntimes retrieve all runtimes related with the project.
func (i interactor) GetProjectRuntimes(ctx context.Context, projectId string) ([]entity.Runtime, error) {
	// get generic project runtimes
	genericRuntimes, err := i.repo.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	// get project specific runtimes
	pr, err := i.projectRepo.Get(ctx, projectId)
	if err != nil {
		return nil, err
	}

	return append(genericRuntimes, pr.Runtimes...), nil
}

func (i interactor) GetRunningRuntime(ctx context.Context, username string) (*entity.Runtime, error) {
	runtimeId, err := i.k8sClient.GetRunningRuntimePODRuntimeId(ctx, username)
	if err != nil {
		return nil, err
	}

	if runtimeId != "" {
		i.logger.Infof("RuntimeId in runtime POD " + runtimeId)

		runtime, err := i.repo.Get(ctx, runtimeId)
		if err != nil {
			return nil, err
		}

		return &runtime, nil
	}

	return nil, entity.NoRunningRuntime
}
