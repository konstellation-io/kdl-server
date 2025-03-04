package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.64

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/http/middleware"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/dataloader"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/graph/generated"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/graph/model"
	"github.com/konstellation-io/kdl-server/app/api/usecase/project"
)

// User is the resolver for the user field.
func (r *memberResolver) User(ctx context.Context, obj *entity.Member) (*entity.User, error) {
	u, err := dataloader.For(ctx).UserByID.Load(obj.UserID)
	return &u, err
}

// AddedDate is the resolver for the addedDate field.
func (r *memberResolver) AddedDate(ctx context.Context, obj *entity.Member) (string, error) {
	return obj.AddedDate.Format(time.RFC3339), nil
}

// RegenerateSSHKey is the resolver for the regenerateSSHKey field.
func (r *mutationResolver) RegenerateSSHKey(ctx context.Context) (*entity.User, error) {
	loggedUser, err := r.getLoggedUser(ctx)
	if err != nil {
		return nil, err
	}

	loggedUser, err = r.users.RegenerateSSHKeys(ctx, loggedUser)
	if err != nil {
		return nil, err
	}

	return &loggedUser, nil
}

// SetActiveUserTools is the resolver for the setActiveUserTools field.
func (r *mutationResolver) SetActiveUserTools(ctx context.Context, input model.SetActiveUserToolsInput) (*entity.User, error) {
	email := ctx.Value(middleware.LoggedUserEmailKey).(string)

	if input.Active {
		u, err := r.users.StartTools(ctx, email, input.RuntimeID, input.CapabilitiesID)
		return &u, err
	}

	u, err := r.users.StopTools(ctx, email)

	return &u, err
}

// UpdateAccessLevel is the resolver for the updateAccessLevel field.
func (r *mutationResolver) UpdateAccessLevel(ctx context.Context, input model.UpdateAccessLevelInput) ([]entity.User, error) {
	return r.users.UpdateAccessLevel(ctx, input.UserIds, input.AccessLevel)
}

// AddMembers is the resolver for the addMembers field.
func (r *mutationResolver) AddMembers(ctx context.Context, input model.AddMembersInput) (*entity.Project, error) {
	loggedUser, err := r.getLoggedUser(ctx)
	if err != nil {
		return nil, err
	}

	users, err := r.users.FindByIDs(ctx, input.UserIds)
	if err != nil {
		return nil, err
	}

	p, err := r.projects.AddMembers(ctx, project.AddMembersOption{
		ProjectID:  input.ProjectID,
		Users:      users,
		LoggedUser: loggedUser,
	})

	return &p, err
}

// CreateProject is the resolver for the createProject field.
func (r *mutationResolver) CreateProject(ctx context.Context, input model.CreateProjectInput) (*entity.Project, error) {
	loggedUser, err := r.getLoggedUser(ctx)
	if err != nil {
		return nil, err
	}

	opts := project.CreateProjectOption{
		ProjectID:   input.ID,
		Name:        input.Name,
		Description: input.Description,
		URL:         &input.Repository.URL,
		Username:    &input.Repository.Username,
		Owner:       loggedUser,
	}

	createdProject, err := r.projects.Create(ctx, opts)
	if err != nil {
		r.logger.Error(err, "Error creating project")
	}

	return &createdProject, err
}

// DeleteProject is the resolver for the deleteProject field.
func (r *mutationResolver) DeleteProject(ctx context.Context, input model.DeleteProjectInput) (*entity.Project, error) {
	loggedUser, err := r.getLoggedUser(ctx)
	if err != nil {
		return nil, err
	}

	p, err := r.projects.Delete(ctx, project.DeleteProjectOption{
		LoggedUser: loggedUser,
		ProjectID:  input.ID,
	})

	return p, err
}

// RemoveMembers is the resolver for the removeMembers field.
func (r *mutationResolver) RemoveMembers(ctx context.Context, input model.RemoveMembersInput) (*entity.Project, error) {
	loggedUser, err := r.getLoggedUser(ctx)
	if err != nil {
		return nil, err
	}

	users, err := r.users.FindByIDs(ctx, input.UserIds)
	if err != nil {
		return nil, err
	}

	p, err := r.projects.RemoveMembers(ctx, project.RemoveMembersOption{
		ProjectID:  input.ProjectID,
		Users:      users,
		LoggedUser: loggedUser,
	})

	return &p, err
}

// UpdateMembers is the resolver for the updateMembers field.
func (r *mutationResolver) UpdateMembers(ctx context.Context, input model.UpdateMembersInput) (*entity.Project, error) {
	loggedUser, err := r.getLoggedUser(ctx)
	if err != nil {
		return nil, err
	}

	users, err := r.users.FindByIDs(ctx, input.UserIds)
	if err != nil {
		return nil, err
	}

	p, err := r.projects.UpdateMembers(ctx, project.UpdateMembersOption{
		ProjectID:   input.ProjectID,
		Users:       users,
		AccessLevel: input.AccessLevel,
		LoggedUser:  loggedUser,
	})

	return &p, err
}

// UpdateProject is the resolver for the updateProject field.
func (r *mutationResolver) UpdateProject(ctx context.Context, input model.UpdateProjectInput) (*entity.Project, error) {
	p, err := r.projects.Update(ctx, project.UpdateProjectOption{
		ProjectID:   input.ID,
		Name:        input.Name,
		Description: input.Description,
		Archived:    input.Archived,
	})

	return &p, err
}

// AddAPIToken is the resolver for the addApiToken field.
func (r *mutationResolver) AddAPIToken(ctx context.Context, input *model.APITokenInput) (*entity.APIToken, error) {
	return nil, entity.ErrNotImplemented
}

// RemoveAPIToken is the resolver for the removeApiToken field.
func (r *mutationResolver) RemoveAPIToken(ctx context.Context, input *model.RemoveAPITokenInput) (*entity.APIToken, error) {
	return nil, entity.ErrNotImplemented
}

// CreationDate is the resolver for the creationDate field.
func (r *projectResolver) CreationDate(ctx context.Context, obj *entity.Project) (string, error) {
	return obj.CreationDate.Format(time.RFC3339), nil
}

// ToolUrls is the resolver for the toolUrls field.
func (r *projectResolver) ToolUrls(ctx context.Context, obj *entity.Project) (*entity.ToolUrls, error) {
	mlflowWithProject := strings.Replace(r.cfg.ProjectMLFlowURL, "PROJECT_ID", obj.ID, 1)
	filebrowserWithProject := strings.Replace(r.cfg.ProjectFilebrowserURL, "PROJECT_ID", obj.ID, 1)
	minioConsole := fmt.Sprintf("%s/buckets/%s/browse", r.cfg.Minio.ConsoleURL, obj.ID)
	kgWithProject := ""

	if r.cfg.Kg.Enabled {
		kgWithProject = strings.Replace(r.cfg.Kg.URL, "PROJECT_ID", obj.ID, 1)
	}

	return &entity.ToolUrls{
		KnowledgeGalaxyEnabled: r.cfg.Kg.Enabled,
		KnowledgeGalaxy:        kgWithProject,
		Filebrowser:            filebrowserWithProject,
		MLFlow:                 mlflowWithProject,
		Minio:                  minioConsole,
	}, nil
}

// NeedAccess is the resolver for the needAccess field.
func (r *projectResolver) NeedAccess(ctx context.Context, obj *entity.Project) (bool, error) {
	loggedUser, err := r.getLoggedUser(ctx)
	if err != nil {
		return true, err
	}

	for _, member := range obj.Members {
		if member.UserID == loggedUser.ID {
			return false, nil
		}
	}

	return true, nil
}

// Capabilities is the resolver for the capabilities field.
func (r *queryResolver) Capabilities(ctx context.Context) ([]model.Capability, error) {
	return r.capabilities.GetCapabilities(ctx)
}

// Kubeconfig is the resolver for the kubeconfig field.
func (r *queryResolver) Kubeconfig(ctx context.Context) (string, error) {
	email := ctx.Value(middleware.LoggedUserEmailKey).(string)

	user, err := r.users.GetByEmail(ctx, email)
	if err != nil {
		return "", err
	}

	k, err := r.users.GetKubeconfig(ctx, user.Username)

	return k, err
}

// Me is the resolver for the me field.
func (r *queryResolver) Me(ctx context.Context) (*entity.User, error) {
	loggedUser, err := r.getLoggedUser(ctx)
	if err != nil {
		return nil, err
	}

	return &loggedUser, nil
}

// Project is the resolver for the project field.
func (r *queryResolver) Project(ctx context.Context, id string) (*entity.Project, error) {
	p, err := r.projects.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	return &p, nil
}

// Projects is the resolver for the projects field.
func (r *queryResolver) Projects(ctx context.Context) ([]entity.Project, error) {
	return r.projects.FindAll(ctx)
}

// QualityProjectDesc is the resolver for the qualityProjectDesc field.
func (r *queryResolver) QualityProjectDesc(ctx context.Context, description string) (*model.QualityProjectDesc, error) {
	panic(entity.ErrNotImplemented) // implemented in knowledge galaxy server
}

// RunningCapability is the resolver for the runningCapability field.
func (r *queryResolver) RunningCapability(ctx context.Context) (*model.Capability, error) {
	email := ctx.Value(middleware.LoggedUserEmailKey).(string)

	user, err := r.users.GetByEmail(ctx, email)
	if err != nil {
		return &model.Capability{}, err
	}

	capabilities, err := r.capabilities.GetRunningCapability(ctx, user.Username)
	return capabilities, err
}

// RunningRuntime is the resolver for the runningRuntime field.
func (r *queryResolver) RunningRuntime(ctx context.Context) (*entity.Runtime, error) {
	email := ctx.Value(middleware.LoggedUserEmailKey).(string)

	user, err := r.users.GetByEmail(ctx, email)
	if err != nil {
		return &entity.Runtime{}, err
	}
	runtime, err := r.runtimes.GetRunningRuntime(ctx, user.Username)
	return runtime, err
}

// Runtimes is the resolver for the runtimes field.
func (r *queryResolver) Runtimes(ctx context.Context) ([]entity.Runtime, error) {
	email := ctx.Value(middleware.LoggedUserEmailKey).(string)

	user, err := r.users.GetByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	return r.runtimes.GetRuntimes(ctx, user.Username)
}

// Users is the resolver for the users field.
func (r *queryResolver) Users(ctx context.Context) ([]entity.User, error) {
	return r.users.FindAll(ctx)
}

// CreationDate is the resolver for the creationDate field.
func (r *sSHKeyResolver) CreationDate(ctx context.Context, obj *entity.SSHKey) (string, error) {
	return obj.CreationDate.Format(time.RFC3339), nil
}

// LastActivity is the resolver for the lastActivity field.
func (r *sSHKeyResolver) LastActivity(ctx context.Context, obj *entity.SSHKey) (*string, error) {
	if obj.LastActivity == nil {
		return nil, nil
	}

	lastActivity := obj.LastActivity.Format(time.RFC3339)

	return &lastActivity, nil
}

// CreationDate is the resolver for the creationDate field.
func (r *userResolver) CreationDate(ctx context.Context, obj *entity.User) (string, error) {
	return obj.CreationDate.Format(time.RFC3339), nil
}

// LastActivity is the resolver for the lastActivity field.
func (r *userResolver) LastActivity(ctx context.Context, obj *entity.User) (*string, error) {
	if obj.LastActivity.IsZero() {
		return nil, nil
	}

	lastActivity := obj.LastActivity.Format(time.RFC3339)

	return &lastActivity, nil
}

// IsKubeconfigEnabled is the resolver for the isKubeconfigEnabled field.
func (r *userResolver) IsKubeconfigEnabled(ctx context.Context, obj *entity.User) (bool, error) {
	return r.users.IsKubeconfigActive(), nil
}

// Member returns generated.MemberResolver implementation.
func (r *Resolver) Member() generated.MemberResolver { return &memberResolver{r} }

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

type memberResolver struct{ *Resolver }
type mutationResolver struct{ *Resolver }
type projectResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
type sSHKeyResolver struct{ *Resolver }
type userResolver struct{ *Resolver }
