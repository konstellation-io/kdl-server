package graph

import (
	"github.com/konstellation-io/kdl-server/app/api/usecase/project"
	"github.com/konstellation-io/kdl-server/app/api/usecase/user"
)

//go:generate go run github.com/99designs/gqlgen

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	projects project.UseCase
	users    user.UseCase
}

func NewResolver(projectInteractor project.UseCase, userInteractor user.UseCase) *Resolver {
	return &Resolver{projects: projectInteractor, users: userInteractor}
}
