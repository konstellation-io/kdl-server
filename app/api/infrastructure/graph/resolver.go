package graph

import (
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/config"
	"github.com/konstellation-io/kdl-server/app/api/usecase/kg"
	"github.com/konstellation-io/kdl-server/app/api/usecase/project"
	"github.com/konstellation-io/kdl-server/app/api/usecase/user"
)

//go:generate go run github.com/99designs/gqlgen

// This file will not be regenerated automatically.

// Resolver serves as dependency injection for the app, add any dependencies app require here.
type Resolver struct {
	cfg      config.Config
	projects project.UseCase
	users    user.UseCase
	kg       kg.UseCase
}

// NewResolver is a constructor function.
func NewResolver(cfg config.Config, projectInteractor project.UseCase, userInteractor user.UseCase, kgInteractor kg.UseCase) *Resolver {
	return &Resolver{cfg: cfg, projects: projectInteractor, users: userInteractor, kg: kgInteractor}
}
