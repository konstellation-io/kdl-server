package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/gosimple/slug"
	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/http/middleware"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/dataloader"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/graph/generated"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/graph/model"
	"github.com/konstellation-io/kdl-server/app/api/pkg/kdlutil"
	"github.com/konstellation-io/kdl-server/app/api/usecase/project"
)

func (r *memberResolver) User(ctx context.Context, obj *entity.Member) (*entity.User, error) {
	u, err := dataloader.For(ctx).UserByID.Load(obj.UserID)
	return &u, err
}

func (r *memberResolver) AddedDate(ctx context.Context, obj *entity.Member) (string, error) {
	return obj.AddedDate.Format(time.RFC3339), nil
}

func (r *mutationResolver) RemoveUsers(ctx context.Context, input model.RemoveUsersInput) ([]entity.User, error) {
	return nil, entity.ErrNotImplemented
}

func (r *mutationResolver) UpdateAccessLevel(ctx context.Context, input model.UpdateAccessLevelInput) ([]entity.User, error) {
	return r.users.UpdateAccessLevel(ctx, input.UserIds, input.AccessLevel)
}

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

func (r *mutationResolver) CreateProject(ctx context.Context, input model.CreateProjectInput) (*entity.Project, error) {
	loggedUser, err := r.getLoggedUser(ctx)
	if err != nil {
		return nil, err
	}

	opts := project.CreateProjectOption{
		ProjectID:   input.ID,
		Name:        input.Name,
		Description: input.Description,
		RepoType:    input.Repository.Type,
		Owner:       loggedUser,
	}

	if input.Repository.External != nil {
		opts.ExternalRepoURL = &input.Repository.External.URL
		opts.ExternalRepoUsername = &input.Repository.External.Username
		opts.ExternalRepoToken = &input.Repository.External.Token
	}

	createdProject, err := r.projects.Create(ctx, opts)

	if err != nil {
		r.logger.Errorf("Error creating project: %s", err)
	}

	return &createdProject, err
}

func (r *mutationResolver) UpdateProject(ctx context.Context, input model.UpdateProjectInput) (*entity.Project, error) {
	p, err := r.projects.Update(ctx, project.UpdateProjectOption{
		ProjectID:   input.ID,
		Name:        input.Name,
		Description: input.Description,
		Archived:    input.Archived,
	})

	return &p, err
}

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

func (r *mutationResolver) AddAPIToken(ctx context.Context, input *model.APITokenInput) (*entity.APIToken, error) {
	return nil, entity.ErrNotImplemented
}

func (r *mutationResolver) RemoveAPIToken(ctx context.Context, input *model.RemoveAPITokenInput) (*entity.APIToken, error) {
	return nil, entity.ErrNotImplemented
}

func (r *mutationResolver) SetActiveUserTools(ctx context.Context, input model.SetActiveUserToolsInput) (*entity.User, error) {
	username := ctx.Value(middleware.LoggedUserNameKey).(string)

	if input.Active {
		u, err := r.users.StartTools(ctx, username, *input.RuntimeID)
		return &u, err
	}

	u, err := r.users.StopTools(ctx, username)

	return &u, err
}

func (r *mutationResolver) SyncUsers(ctx context.Context) (*model.SyncUsersResponse, error) {
	r.users.RunSyncUsersCronJob()

	return &model.SyncUsersResponse{Msg: "External user data synchronization has started."}, nil
}

func (r *projectResolver) CreationDate(ctx context.Context, obj *entity.Project) (string, error) {
	return obj.CreationDate.Format(time.RFC3339), nil
}

func (r *projectResolver) ToolUrls(ctx context.Context, obj *entity.Project) (*entity.ToolUrls, error) {
	userName := ctx.Value(middleware.LoggedUserNameKey).(string)
	slugUserName := slug.Make(userName)

	folderName := obj.Repository.RepoName

	giteaWithFolder, err := kdlutil.JoinToURL(r.cfg.Gitea.URL, "kdl", folderName)
	if err != nil {
		return &entity.ToolUrls{}, err
	}

	jupyterWithUsername := strings.Replace(r.cfg.Jupyter.URL, "USERNAME", slugUserName, 1)
	jupyterWithUsernameAndFolder := strings.Replace(jupyterWithUsername, "REPO_FOLDER", folderName, 2)
	vscodeWithUsername := strings.Replace(r.cfg.VSCode.URL, "USERNAME", slugUserName, 1)
	vscodeWithUsernameAndFolder := strings.Replace(vscodeWithUsername, "REPO_FOLDER", folderName, 1)
	mlflowWithProject := strings.Replace(r.cfg.ProjectMLFlow.URL, "PROJECT_ID", obj.ID, 1)
	filebrowserWithProject := strings.Replace(r.cfg.ProjectFilebrowser.URL, "PROJECT_ID", obj.ID, 1)
	kgWithProject := ""

	if r.cfg.Kg.Enabled {
		kgWithProject = strings.Replace(r.cfg.Kg.URL, "PROJECT_ID", obj.ID, 1)
	}

	return &entity.ToolUrls{
		KnowledgeGalaxy: kgWithProject,
		Gitea:           giteaWithFolder,
		Filebrowser:     filebrowserWithProject,
		Jupyter:         jupyterWithUsernameAndFolder,
		VSCode:          vscodeWithUsernameAndFolder,
		Drone:           r.cfg.Drone.URL,
		MLFlow:          mlflowWithProject,
	}, nil
}

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

func (r *queryResolver) Me(ctx context.Context) (*entity.User, error) {
	loggedUser, err := r.getLoggedUser(ctx)
	if err != nil {
		return nil, err
	}

	return &loggedUser, nil
}

func (r *queryResolver) Projects(ctx context.Context) ([]entity.Project, error) {
	return r.projects.FindAll(ctx)
}

func (r *queryResolver) Project(ctx context.Context, id string) (*entity.Project, error) {
	p, err := r.projects.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	return &p, nil
}

func (r *queryResolver) Users(ctx context.Context) ([]entity.User, error) {
	return r.users.FindAll(ctx)
}

func (r *queryResolver) QualityProjectDesc(ctx context.Context, description string) (*model.QualityProjectDesc, error) {
	panic(entity.ErrNotImplemented) // implemented in knowledge galaxy server
}

func (r *queryResolver) Runtimes(ctx context.Context, projectID string) ([]entity.Runtime, error) {
	return r.runtimes.GetProjectRuntimes(ctx, projectID)
}

func (r *queryResolver) RunningRuntime(ctx context.Context) (*entity.Runtime, error) {
	runtime, err := r.runtimes.GetRunningRuntime(ctx, ctx.Value(middleware.LoggedUserNameKey).(string))
	return runtime, err
}

func (r *repositoryResolver) URL(ctx context.Context, obj *entity.Repository) (string, error) {
	switch obj.Type {
	case entity.RepositoryTypeInternal:
		return fmt.Sprintf("%s/kdl/%s", r.cfg.Gitea.URL, obj.RepoName), nil
	case entity.RepositoryTypeExternal:
		return obj.ExternalRepoURL, nil
	}

	return "", nil
}

func (r *sSHKeyResolver) CreationDate(ctx context.Context, obj *entity.SSHKey) (string, error) {
	return obj.CreationDate.Format(time.RFC3339), nil
}

func (r *sSHKeyResolver) LastActivity(ctx context.Context, obj *entity.SSHKey) (*string, error) {
	if obj.LastActivity == nil {
		return nil, nil
	}

	lastActivity := obj.LastActivity.Format(time.RFC3339)

	return &lastActivity, nil
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

func (r *userResolver) AreToolsActive(ctx context.Context, obj *entity.User) (bool, error) {
	username := ctx.Value(middleware.LoggedUserNameKey).(string)

	return r.users.AreToolsRunning(ctx, username)
}

// Member returns generated.MemberResolver implementation.
func (r *Resolver) Member() generated.MemberResolver { return &memberResolver{r} }

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Project returns generated.ProjectResolver implementation.
func (r *Resolver) Project() generated.ProjectResolver { return &projectResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

// Repository returns generated.RepositoryResolver implementation.
func (r *Resolver) Repository() generated.RepositoryResolver { return &repositoryResolver{r} }

// SSHKey returns generated.SSHKeyResolver implementation.
func (r *Resolver) SSHKey() generated.SSHKeyResolver { return &sSHKeyResolver{r} }

// User returns generated.UserResolver implementation.
func (r *Resolver) User() generated.UserResolver { return &userResolver{r} }

type memberResolver struct{ *Resolver }
type mutationResolver struct{ *Resolver }
type projectResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
type repositoryResolver struct{ *Resolver }
type sSHKeyResolver struct{ *Resolver }
type userResolver struct{ *Resolver }
