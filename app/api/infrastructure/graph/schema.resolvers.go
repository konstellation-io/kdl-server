package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"time"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/graph/generated"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/graph/model"
)

func (r *mutationResolver) AddUser(ctx context.Context, input model.AddUserInput) (*entity.User, error) {
	user, err := r.users.Create(ctx, input.Email, input.Username, input.Password, input.AccessLevel)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *mutationResolver) RemoveUsers(ctx context.Context, input model.RemoveUsersInput) ([]entity.User, error) {
	panic(entity.ErrNotImplemented)
}

func (r *mutationResolver) UpdateAccessLevel(ctx context.Context, input model.UpdateAccessLevelInput) ([]entity.User, error) {
	panic(entity.ErrNotImplemented)
}

func (r *mutationResolver) RegenerateSSHKey(ctx context.Context) (*entity.SSHKey, error) {
	panic(entity.ErrNotImplemented)
}

func (r *mutationResolver) CreateProject(ctx context.Context, input model.CreateProjectInput) (*entity.Project, error) {
	createdProject, err := r.projects.Create(ctx, input.Name, input.Description)

	return &createdProject, err
}

func (r *mutationResolver) UpdateProject(ctx context.Context, input model.UpdateProjectInput) (*entity.Project, error) {
	panic(entity.ErrNotImplemented)
}

func (r *mutationResolver) AddMembers(ctx context.Context, input model.AddMembersInput) ([]entity.Member, error) {
	panic(entity.ErrNotImplemented)
}

func (r *mutationResolver) RemoveMember(ctx context.Context, input model.RemoveMemberInput) (*entity.Member, error) {
	panic(entity.ErrNotImplemented)
}

func (r *mutationResolver) UpdateMember(ctx context.Context, input model.UpdateMemberInput) (*entity.Member, error) {
	panic(entity.ErrNotImplemented)
}

func (r *mutationResolver) AddAPIToken(ctx context.Context, input *model.APITokenInput) (*entity.APIToken, error) {
	panic(entity.ErrNotImplemented)
}

func (r *mutationResolver) RemoveAPIToken(ctx context.Context, input *model.RemoveAPITokenInput) (*entity.APIToken, error) {
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

func (r *projectResolver) CreationDate(ctx context.Context, obj *entity.Project) (string, error) {
	panic(entity.ErrNotImplemented)
}

func (r *queryResolver) Me(ctx context.Context) (*entity.User, error) {
	panic(entity.ErrNotImplemented)
}

func (r *queryResolver) Projects(ctx context.Context) ([]entity.Project, error) {
	panic(entity.ErrNotImplemented)
}

func (r *queryResolver) Project(ctx context.Context, id string) (*entity.Project, error) {
	panic(entity.ErrNotImplemented)
}

func (r *queryResolver) Users(ctx context.Context) ([]entity.User, error) {
	panic(entity.ErrNotImplemented)
}

func (r *queryResolver) SSHKey(ctx context.Context) (*entity.SSHKey, error) {
	panic(entity.ErrNotImplemented)
}

func (r *queryResolver) QualityProjectDesc(ctx context.Context, description string) (*model.QualityProjectDesc, error) {
	panic(entity.ErrNotImplemented)
}

func (r *queryResolver) KnowledgeGraph(ctx context.Context, description string) (*model.KnowledgeGraph, error) {
	panic(entity.ErrNotImplemented)
}

func (r *sSHKeyResolver) CreationDate(ctx context.Context, obj *entity.SSHKey) (string, error) {
	panic(entity.ErrNotImplemented)
}

func (r *sSHKeyResolver) LastActivity(ctx context.Context, obj *entity.SSHKey) (*string, error) {
	panic(entity.ErrNotImplemented)
}

func (r *userResolver) CreationDate(ctx context.Context, obj *entity.User) (string, error) {
	return obj.CreationDate.Format(time.RFC3339), nil
}

func (r *userResolver) LastActivity(ctx context.Context, obj *entity.User) (*string, error) {
	if obj.LastActivity == nil {
		return nil, nil
	}

	lastActivity := obj.LastActivity.Format(time.RFC3339)

	return &lastActivity, nil
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Project returns generated.ProjectResolver implementation.
func (r *Resolver) Project() generated.ProjectResolver { return &projectResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

// SSHKey returns generated.SSHKeyResolver implementation.
func (r *Resolver) SSHKey() generated.SSHKeyResolver { return &sSHKeyResolver{r} }

// User returns generated.UserResolver implementation.
func (r *Resolver) User() generated.UserResolver { return &userResolver{r} }

type mutationResolver struct{ *Resolver }
type projectResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
type sSHKeyResolver struct{ *Resolver }
type userResolver struct{ *Resolver }
