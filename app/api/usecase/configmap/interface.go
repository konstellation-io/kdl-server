package configmap

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

import (
	"context"
)

// UseCase interface to manage all operations related with configmap.
type UseCase interface {
	WatchConfigMapTemplates(ctx context.Context) error
}
