package runtime

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

import (
	"context"

	"github.com/konstellation-io/kdl-server/app/api/entity"
)

// Repository interface to retrieve and persists runtimes.
type Repository interface {
	Get(ctx context.Context, id string) (entity.Runtime, error)
	FindAll(ctx context.Context) ([]entity.Runtime, error)
}

// UseCase interface to manage all operations related with runtimes.
type UseCase interface {
	GetProjectRuntimes(ctx context.Context, projectId string) ([]entity.Runtime, error)
	GetRunningRuntime(ctx context.Context, username string) (*entity.Runtime, error)
}
