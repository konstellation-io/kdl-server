package graph

import "github.com/konstellation-io/kdl-server/app/api/application/project"

//go:generate go run github.com/99designs/gqlgen

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct {
	projectInteractor *project.Interactor
}

func NewResolver(projectInteractor *project.Interactor) *Resolver {
	return &Resolver{projectInteractor: projectInteractor}
}
