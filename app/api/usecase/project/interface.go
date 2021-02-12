package project

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

import (
	"context"

	"github.com/konstellation-io/kdl-server/app/api/entity"
)

// Repository interface to retrieve and persists projects.
type Repository interface {
	Get(ctx context.Context, id string) (entity.Project, error)
	Create(ctx context.Context, project entity.Project) (string, error)
}

// UseCase interface to manage all operations related with projects.
type UseCase interface {
	Create(ctx context.Context, opt CreateProjectOption) (entity.Project, error)
}
