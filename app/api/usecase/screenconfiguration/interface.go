package screenconfiguration

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

import (
	"context"

	"github.com/konstellation-io/kdl-server/app/api/entity"
)

// Repository interface to retrieve project settings.
type Repository interface {
	GetCreateProjectSettings(ctx context.Context) (entity.CreateProjectSettings, error)
	CreateCreateProjectSettings(ctx context.Context, set entity.CreateProjectSettings) error
}

// UseCase interface to manage all operations related with screen configuration.
type UseCase interface {
	GetCreateProjectSettings(ctx context.Context) (entity.CreateProjectSettings, error)
}
