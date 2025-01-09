package capabilities

import (
	"context"
	"errors"

	"github.com/go-logr/logr"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/config"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/graph/model"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/k8s"
)

var (
	ErrStopUserTools   = errors.New("cannot stop uninitialized user tools")
	ErrUserToolsActive = errors.New("it is not possible to regenerate SSH keys with the usertools active")
)

type interactor struct {
	logger    logr.Logger
	cfg       config.Config
	repo      Repository
	k8sClient k8s.ClientInterface
}

// NewInteractor factory function.
func NewInteractor(
	logger logr.Logger,
	cfg config.Config,
	repo Repository,
	k8sClient k8s.ClientInterface,
) UseCase {
	return &interactor{
		logger:    logger,
		cfg:       cfg,
		repo:      repo,
		k8sClient: k8sClient,
	}
}

// Retrieve all capabilities.
func (i *interactor) GetCapabilities(ctx context.Context) ([]model.Capability, error) {
	capabilities, err := i.repo.FindAll(ctx)
	if err != nil {
		return []model.Capability{}, err
	}

	capabilitiesList := make([]model.Capability, len(capabilities))
	for idx, element := range capabilities {
		capabilitiesList[idx] = model.Capability{ID: element.ID, Name: element.Name, Default: element.Default}
	}

	return capabilitiesList, err
}

// Retrieve the running capability.
func (i *interactor) GetRunningCapability(ctx context.Context, username string) (*model.Capability, error) {
	capabilityID, err := i.k8sClient.GetCapabilitiesIDFromUserTools(ctx, username)
	if err != nil {
		return nil, err
	}

	if capabilityID != "" {
		i.logger.Info("Capability in running runtime POD found", "capabilityID", capabilityID, "username", username)

		capability, err := i.repo.Get(ctx, capabilityID)
		if err != nil {
			return nil, err
		}

		return &model.Capability{ID: capability.ID, Name: capability.Name, Default: capability.Default}, nil
	}

	return nil, nil
}
