package user

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

import (
	"context"

	"github.com/konstellation-io/kdl-server/app/api/entity"
)

type Repository interface {
	EnsureIndexes() error
	Get(ctx context.Context, id string) (entity.User, error)
	Create(ctx context.Context, user entity.User) (string, error)
}

type UseCase interface {
	Create(ctx context.Context, email string, accessLevel entity.AccessLevel) (entity.User, error)
}
