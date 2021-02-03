package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/graph/generated"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/graph/model"
)

func (r *mutationResolver) CreateProject(ctx context.Context, input model.CreateProjectInput) (*entity.Project, error) {
	projectInput := entity.NewProject(input.Name, input.Description)
	createdProject, err := r.projectInteractor.Create(ctx, projectInput)
	return &createdProject, err
}

func (r *mutationResolver) UpdateProject(ctx context.Context, input model.UpdateProjectInput) (*entity.Project, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *queryResolver) Projects(ctx context.Context) ([]*entity.Project, error) {
	panic(fmt.Errorf("not implemented"))
}

func (r *queryResolver) Project(ctx context.Context, id string) (*entity.Project, error) {
	panic(fmt.Errorf("not implemented"))
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
