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

func (r *mutationResolver) AddUser(ctx context.Context, input model.AddUserInput) (*entity.User, error) {
	user, err := r.users.Create(ctx, input.Email, input.Username, input.Password, input.AccessLevel)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *mutationResolver) RemoveUsers(ctx context.Context, input model.RemoveUsersInput) ([]entity.User, error) {
	return nil, entity.ErrNotImplemented
}

func (r *mutationResolver) UpdateAccessLevel(ctx context.Context, input model.UpdateAccessLevelInput) ([]entity.User, error) {
	return nil, entity.ErrNotImplemented
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

	internalRepoName := ""
	externalRepoURL := ""
	externalRepoUsername := ""
	externalRepoToken := ""

	switch input.Repository.Type {
	case entity.RepositoryTypeInternal:
		if input.Repository.Internal != nil {
			internalRepoName = input.Repository.Internal.Name
		}
	case entity.RepositoryTypeExternal:
		if input.Repository.External != nil {
			externalRepoURL = input.Repository.External.URL
			externalRepoUsername = input.Repository.External.Username
			externalRepoToken = input.Repository.External.Token
		}
	default:
		return &entity.Project{}, entity.ErrInvalidRepoType
	}

	createdProject, err := r.projects.Create(ctx, project.CreateProjectOption{
		Name:                 input.Name,
		Description:          input.Description,
		RepoType:             input.Repository.Type,
		InternalRepoName:     &internalRepoName,
		ExternalRepoURL:      &externalRepoURL,
		ExternalRepoUsername: &externalRepoUsername,
		ExternalRepoToken:    &externalRepoToken,
		Owner:                loggedUser,
	})

	return &createdProject, err
}

func (r *mutationResolver) UpdateProject(ctx context.Context, input model.UpdateProjectInput) (*entity.Project, error) {
	p, err := r.projects.Update(ctx, project.UpdateProjectOption{
		ProjectID:   input.ID,
		Name:        input.Name,
		Description: input.Description,
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

func (r *mutationResolver) RemoveMember(ctx context.Context, input model.RemoveMemberInput) (*entity.Project, error) {
	loggedUser, err := r.getLoggedUser(ctx)
	if err != nil {
		return nil, err
	}

	user, err := r.users.GetByID(ctx, input.UserID)
	if err != nil {
		return nil, err
	}

	p, err := r.projects.RemoveMember(ctx, project.RemoveMemberOption{
		ProjectID:  input.ProjectID,
		User:       user,
		LoggedUser: loggedUser,
	})

	return &p, err
}

func (r *mutationResolver) UpdateMember(ctx context.Context, input model.UpdateMemberInput) (*entity.Project, error) {
	loggedUser, err := r.getLoggedUser(ctx)
	if err != nil {
		return nil, err
	}

	user, err := r.users.GetByID(ctx, input.UserID)
	if err != nil {
		return nil, err
	}

	p, err := r.projects.UpdateMember(ctx, project.UpdateMemberOption{
		ProjectID:   input.ProjectID,
		User:        user,
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

func (r *mutationResolver) SetStarredKGItem(ctx context.Context, input model.SetBoolFieldInput) (*entity.KnowledgeGraphItem, error) {
	return nil, entity.ErrNotImplemented
}

func (r *mutationResolver) SetDiscardedKGItem(ctx context.Context, input model.SetBoolFieldInput) (*entity.KnowledgeGraphItem, error) {
	return nil, entity.ErrNotImplemented
}

func (r *mutationResolver) SetActiveUserTools(ctx context.Context, input model.SetActiveUserToolsInput) (*entity.User, error) {
	username := ctx.Value(middleware.LoggedUserNameKey).(string)

	if input.Active {
		u, err := r.users.StartTools(ctx, username)
		return &u, err
	}

	u, err := r.users.StopTools(ctx, username)

	return &u, err
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

	droneWithFolder, err := kdlutil.JoinToURL(r.cfg.Drone.URL, "kdl", folderName)
	if err != nil {
		return &entity.ToolUrls{}, err
	}

	jupyterWithUsername := strings.Replace(r.cfg.Jupyter.URL, "USERNAME", slugUserName, 1)
	jupyterWithUsernameAndFolder := strings.Replace(jupyterWithUsername, "REPO_FOLDER", folderName, 2)
	vscodeWithUsername := strings.Replace(r.cfg.VSCode.URL, "USERNAME", slugUserName, 1)
	vscodeWithUsernameAndFolder := strings.Replace(vscodeWithUsername, "REPO_FOLDER", folderName, 1)

	return &entity.ToolUrls{
		Gitea:   giteaWithFolder,
		Minio:   r.cfg.Minio.URL,
		Jupyter: jupyterWithUsernameAndFolder,
		VSCode:  vscodeWithUsernameAndFolder,
		Drone:   droneWithFolder,
		MLFlow:  r.cfg.MLFlow.URL,
	}, nil
}

func (r *queryResolver) Me(ctx context.Context) (*entity.User, error) {
	loggedUser, err := r.getLoggedUser(ctx)
	if err != nil {
		return nil, err
	}

	return &loggedUser, nil
}

func (r *queryResolver) Projects(ctx context.Context) ([]entity.Project, error) {
	loggedUser, err := r.getLoggedUser(ctx)
	if err != nil {
		return nil, err
	}

	return r.projects.FindByUserID(ctx, loggedUser.ID)
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
	minWords := 50
	enoughWords := 200

	descriptionWords := len(strings.Fields(description))
	quality := 0

	if descriptionWords > enoughWords {
		quality = 100
	} else if descriptionWords > minWords {
		quality = (descriptionWords - minWords) * 100 / (enoughWords - minWords)
	}

	return &model.QualityProjectDesc{
		Quality: quality,
	}, nil
}

func (r *queryResolver) KnowledgeGraph(ctx context.Context, description string) (*entity.KnowledgeGraph, error) {
	kg, err := r.kg.Get(ctx, description)
	if err != nil {
		return nil, err
	}

	return &kg, nil
}

func (r *queryResolver) KnowledgeGraphItem(ctx context.Context, id string) (*entity.KnowledgeGraphItem, error) {
	kg, err := r.kg.GetItem(ctx, id)
	if err != nil {
		return nil, err
	}

	return &kg, nil
}

func (r *repositoryResolver) URL(ctx context.Context, obj *entity.Repository) (string, error) {
	switch obj.Type {
	case entity.RepositoryTypeInternal:
		return fmt.Sprintf("%s/kdl/%s", r.cfg.Gitea.URL, obj.InternalRepoName), nil
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

	return r.users.AreToolsRunning(username)
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
