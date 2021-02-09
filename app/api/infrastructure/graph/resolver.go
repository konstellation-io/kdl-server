package graph

import (
	"github.com/konstellation-io/kdl-server/app/api/usecase/project"
	"github.com/konstellation-io/kdl-server/app/api/usecase/user"
)

//go:generate go run github.com/99designs/gqlgen

// This file will not be regenerated automatically.

// Resolver serves as dependency injection for the app, add any dependencies app require here.
type Resolver struct {
	projects project.UseCase
	users    user.UseCase
}

// NewResolver is a constructor function.
func NewResolver(projectInteractor project.UseCase, userInteractor user.UseCase) *Resolver {
	return &Resolver{projects: projectInteractor, users: userInteractor}
}
