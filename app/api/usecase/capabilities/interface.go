package capabilities

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

import (
	"context"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/graph/model"
)

// Repository interface to retrieve and persists projects.
type Repository interface {
	Get(ctx context.Context, id string) (entity.Capabilities, error)
	FindAll(ctx context.Context) ([]entity.Capabilities, error)
}

// UseCase interface to manage all operations related with projects.
type UseCase interface {
	GetCapabilities(ctx context.Context) ([]model.Capability, error)
	GetRunningCapability(ctx context.Context, username string) (*model.Capability, error)
}
