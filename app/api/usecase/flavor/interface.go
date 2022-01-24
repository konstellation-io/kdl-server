package flavor

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

import (
	"context"

	"github.com/konstellation-io/kdl-server/app/api/entity"
)

// Repository interface to retrieve and persists flavors.
type Repository interface {
	FindAll(ctx context.Context) ([]entity.Flavor, error)
}

// UseCase interface to manage all operations related with flavors.
type UseCase interface {
	GetProjectFlavors(ctx context.Context, projectId string) ([]entity.Flavor, error)
	GetRunningFlavor(ctx context.Context, username string) ([]entity.Flavor, error)
}
