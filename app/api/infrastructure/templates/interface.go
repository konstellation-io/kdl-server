package templates

import (
	"context"

	"github.com/konstellation-io/kdl-server/app/api/entity"
)

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

type Templating interface {
	GenerateInitialProjectContent(ctx context.Context, project entity.Project, user entity.User) error
}
