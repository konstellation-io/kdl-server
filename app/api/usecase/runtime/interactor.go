package runtime

import (
	"context"

	"github.com/go-logr/logr"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/k8s"

	"github.com/konstellation-io/kdl-server/app/api/entity"
)

type interactor struct {
	logger    logr.Logger
	k8sClient k8s.ClientInterface
	repo      Repository
}

// NewInteractor factory function.
func NewInteractor(
	logger logr.Logger,
	k8sClient k8s.ClientInterface,
	repo Repository,
) UseCase {
	return &interactor{
		logger:    logger,
		k8sClient: k8sClient,
		repo:      repo,
	}
}

// GetRuntimes retrieve all available runtimes.
func (i interactor) GetRuntimes(ctx context.Context, username string) ([]entity.Runtime, error) {
	// get all runtimes
	runtimes, err := i.repo.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	// update the runtime pods names
	for i := range runtimes {
		runtimes[i].RuntimePod = getUsertoolsPodName(username)
	}

	return runtimes, nil
}

// GetRunningRuntime return the running runtime if any. If not it returns a null.
func (i interactor) GetRunningRuntime(ctx context.Context, username string) (*entity.Runtime, error) {
	runtimeID, err := i.k8sClient.GetRuntimeIDFromUserTools(ctx, username)
	if err != nil {
		return nil, err
	}

	if runtimeID != "" {
		i.logger.Info("Running runtime POD found", "runtimeID", runtimeID)

		runtime, err := i.repo.Get(ctx, runtimeID)
		if err != nil {
			return nil, err
		}

		runtime.RuntimePod = getUsertoolsPodName(username)

		return &runtime, nil
	}

	return nil, nil
}

func getUsertoolsPodName(username string) string {
	return "usertools-" + username + "-user-tools-0"
}
