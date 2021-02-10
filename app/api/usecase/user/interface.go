package user

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

import (
	"context"

	"github.com/konstellation-io/kdl-server/app/api/entity"
)

// Repository interface to retrieve and persists users.
type Repository interface {
	EnsureIndexes() error
	Get(ctx context.Context, id string) (entity.User, error)
	GetByUsername(ctx context.Context, username string) (entity.User, error)
	GetByEmail(ctx context.Context, email string) (entity.User, error)
	Create(ctx context.Context, user entity.User) (string, error)
	FindAll(ctx context.Context) ([]entity.User, error)
}

// UseCase interface to manage all operations related with users.
type UseCase interface {
	Create(ctx context.Context, email, username, password string, accessLevel entity.AccessLevel) (entity.User, error)
	FindAll(ctx context.Context) ([]entity.User, error)
}
