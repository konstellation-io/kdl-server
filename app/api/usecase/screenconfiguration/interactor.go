package screenconfiguration

import (
	"context"

	"github.com/go-logr/logr"

	"github.com/konstellation-io/kdl-server/app/api/entity"
)

// interactor implements the screenconfiguration.UseCase interface.
type interactor struct {
	logger                  logr.Logger
	screenConfigurationRepo Repository
}

// Assure implementation adheres to interface.
var _ UseCase = (*interactor)(nil)

// NewInteractor is a constructor function.
func NewInteractor(
	logger logr.Logger,
	screenConfigurationRepo Repository,
) UseCase {
	return &interactor{
		logger:                  logger,
		screenConfigurationRepo: screenConfigurationRepo,
	}
}

// GetCreateProjectSettings retrieves the project settings.
func (i *interactor) GetCreateProjectSettings(ctx context.Context) (entity.CreateProjectSettings, error) {
	return i.screenConfigurationRepo.GetCreateProjectSettings(ctx)
}
