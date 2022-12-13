package capabilities

import (
	"context"
	"errors"

	"github.com/konstellation-io/kdl-server/app/api/infrastructure/config"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/graph/model"

	"github.com/konstellation-io/kdl-server/app/api/infrastructure/k8s"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
)

var (
	ErrStopUserTools   = errors.New("cannot stop uninitialized user tools")
	ErrUserToolsActive = errors.New("it is not possible to regenerate SSH keys with the usertools active")
)

type interactor struct {
	logger    logging.Logger
	cfg       config.Config
	repo      Repository
	k8sClient k8s.Client
}

// NewInteractor factory function.
func NewInteractor(
	logger logging.Logger,
	cfg config.Config,
	repo Repository,
	k8sClient k8s.Client,
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
	i.logger.Infof("Find all capabilities")
	capabilities, err := i.repo.FindAll(ctx)

	if err != nil {
		return []model.Capability{}, err
	}

	i.logger.Infof("Retrieved capabilities: %w", capabilities)

	//nolint:prealloc // No need to preallocate.
	var capabilitiesList []model.Capability
	for _, element := range capabilities {
		capabilitiesList = append(capabilitiesList, model.Capability{ID: element.ID, Name: element.Name, Default: element.Default})
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
		i.logger.Infof("Capability in runtime POD: %w", capabilityID)

		capability, err := i.repo.Get(ctx, capabilityID)
		if err != nil {
			return nil, err
		}

		return &model.Capability{ID: capability.ID, Name: capability.Name, Default: capability.Default}, nil
	}

	return nil, nil
}
