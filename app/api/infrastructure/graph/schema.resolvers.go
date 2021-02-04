package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/graph/generated"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/graph/model"
)

func (r *mutationResolver) AddUser(ctx context.Context, input model.AddUserInput) (*model.User, error) {
	panic(entity.ErrNotImplemented)
}

func (r *mutationResolver) RemoveUsers(ctx context.Context, input model.RemoveUsersInput) ([]*model.User, error) {
	panic(entity.ErrNotImplemented)
}

func (r *mutationResolver) UpdateAccessLevel(ctx context.Context, input model.UpdateAccessLevelInput) ([]*model.User, error) {
	panic(entity.ErrNotImplemented)
}

func (r *mutationResolver) RegenerateSSHKey(ctx context.Context) (*model.SSHKey, error) {
	panic(entity.ErrNotImplemented)
}

func (r *mutationResolver) CreateProject(ctx context.Context, input model.CreateProjectInput) (*entity.Project, error) {
	createdProject, err := r.projectInteractor.Create(ctx, input.Name, input.Description)

	return &createdProject, err
}

func (r *mutationResolver) UpdateProject(ctx context.Context, input model.UpdateProjectInput) (*entity.Project, error) {
	panic(entity.ErrNotImplemented)
}

func (r *mutationResolver) AddMembers(ctx context.Context, input model.AddMembersInput) ([]*entity.Member, error) {
	panic(entity.ErrNotImplemented)
}

func (r *mutationResolver) RemoveMember(ctx context.Context, input model.RemoveMemberInput) (*entity.Member, error) {
	panic(entity.ErrNotImplemented)
}

func (r *mutationResolver) UpdateMember(ctx context.Context, input model.UpdateMemberInput) (*entity.Member, error) {
	panic(entity.ErrNotImplemented)
}

func (r *mutationResolver) AddAPIToken(ctx context.Context, input *model.APITokenInput) (*model.APIToken, error) {
	panic(entity.ErrNotImplemented)
}

func (r *mutationResolver) RemoveAPIToken(ctx context.Context, input *model.RemoveAPITokenInput) (*model.APIToken, error) {
	panic(entity.ErrNotImplemented)
}

func (r *mutationResolver) SetStarredKGItem(ctx context.Context, input model.SetBoolFieldInput) (*model.KnowledgeGraphItem, error) {
	panic(entity.ErrNotImplemented)
}

func (r *mutationResolver) SetDiscardedKGItem(ctx context.Context, input model.SetBoolFieldInput) (*model.KnowledgeGraphItem, error) {
	panic(entity.ErrNotImplemented)
}

func (r *mutationResolver) SetActiveProjectTools(ctx context.Context, input model.SetBoolFieldInput) (*entity.Project, error) {
	panic(entity.ErrNotImplemented)
}

func (r *queryResolver) Me(ctx context.Context) (*model.User, error) {
	panic(entity.ErrNotImplemented)
}

func (r *queryResolver) Projects(ctx context.Context) ([]*entity.Project, error) {
	panic(entity.ErrNotImplemented)
}

func (r *queryResolver) Project(ctx context.Context, id string) (*entity.Project, error) {
	panic(entity.ErrNotImplemented)
}

func (r *queryResolver) Users(ctx context.Context) ([]*model.User, error) {
	panic(entity.ErrNotImplemented)
}

func (r *queryResolver) SSHKey(ctx context.Context) (*model.SSHKey, error) {
	panic(entity.ErrNotImplemented)
}

func (r *queryResolver) QualityProjectDesc(ctx context.Context, description string) (*model.QualityProjectDesc, error) {
	panic(entity.ErrNotImplemented)
}

func (r *queryResolver) KnowledgeGraph(ctx context.Context, description string) (*model.KnowledgeGraph, error) {
	panic(entity.ErrNotImplemented)
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
