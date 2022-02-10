package runtime

import (
	"context"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/k8s"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
)

type interactor struct {
	logger    logging.Logger
	k8sClient k8s.K8sClient
	repo      Repository
}

// NewInteractor factory function.
func NewInteractor(
	logger logging.Logger,
	k8sClient k8s.K8sClient,
	repo Repository,
) UseCase {
	return &interactor{
		logger:    logger,
		k8sClient: k8sClient,
		repo:      repo,
	}
}

// GetRuntimes retrieve all available runtimes.
func (i interactor) GetRuntimes(ctx context.Context) ([]entity.Runtime, error) {
	// get generic project runtimes
	runtimes, err := i.repo.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	return runtimes, nil
}

// GetRunningRuntime return the running runtime if any. If not it returns a null.
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

	return nil, nil
}
