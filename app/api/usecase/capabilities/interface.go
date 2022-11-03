package capabilities

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

import (
	"context"

	"github.com/konstellation-io/kdl-server/app/api/entity"
)

// Repository interface to retrieve and persists projects.
type Repository interface {
	Get(ctx context.Context, id string) (entity.Capabilities, error)
	FindAll(ctx context.Context) ([]entity.Capabilities, error)
}

// UseCase interface to manage all operations related with projects.
type UseCase interface {
	FindAll(ctx context.Context) ([]entity.Project, error)
	GetByID(ctx context.Context, id string) (entity.Project, error)
}
