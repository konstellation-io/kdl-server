package graph

//go:generate go run github.com/99designs/gqlgen generate

import (
	"context"

	"github.com/go-logr/logr"
	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/http/middleware"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/config"
	"github.com/konstellation-io/kdl-server/app/api/usecase/capabilities"
	"github.com/konstellation-io/kdl-server/app/api/usecase/project"
	"github.com/konstellation-io/kdl-server/app/api/usecase/runtime"
	"github.com/konstellation-io/kdl-server/app/api/usecase/user"
)

//go:generate go get github.com/99designs/gqlgen
//go:generate go run github.com/99designs/gqlgen

// This file will not be regenerated automatically.

// Resolver serves as dependency injection for the app, add any dependencies app require here.
type Resolver struct {
	logger       logr.Logger
	cfg          config.Config
	projects     project.UseCase
	users        user.UseCase
	runtimes     runtime.UseCase
	capabilities capabilities.UseCase
}

// NewResolver is a constructor function.
func NewResolver(
	logger logr.Logger,
	cfg config.Config,
	projectInteractor project.UseCase,
	userInteractor user.UseCase,
	runtimeInteractor runtime.UseCase,
	capabilitiesInteractor capabilities.UseCase,
) *Resolver {
	return &Resolver{
		logger:       logger,
		cfg:          cfg,
		projects:     projectInteractor,
		users:        userInteractor,
		runtimes:     runtimeInteractor,
		capabilities: capabilitiesInteractor,
	}
}

func (r *Resolver) getLoggedUser(ctx context.Context) (entity.User, error) {
	username := ctx.Value(middleware.LoggedUserNameKey).(string)

	return r.users.GetByUsername(ctx, username)
}
