package graph

//go:generate go run github.com/99designs/gqlgen generate

import (
	"context"
	"errors"

	"github.com/go-logr/logr"
	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/http/middleware"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/config"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/graph/generated"
	"github.com/konstellation-io/kdl-server/app/api/usecase/capabilities"
	"github.com/konstellation-io/kdl-server/app/api/usecase/project"
	"github.com/konstellation-io/kdl-server/app/api/usecase/runtime"
	"github.com/konstellation-io/kdl-server/app/api/usecase/user"
)

//go:generate go get github.com/99designs/gqlgen
//go:generate go run github.com/99designs/gqlgen

// This file will not be regenerated automatically.

var ErrCastingEmailToString = errors.New("error casting email to string")

// Resolver implements the generated.ResolverRoot interface.
var _ generated.ResolverRoot = (*Resolver)(nil)

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
	email, ok := ctx.Value(middleware.LoggedUserEmailKey).(string)

	if !ok {
		return entity.User{}, ErrCastingEmailToString
	}

	return r.users.GetByEmail(ctx, email)
}
