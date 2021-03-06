package project

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

import (
	"context"

	"github.com/konstellation-io/kdl-server/app/api/entity"
)

// Repository interface to retrieve and persists projects.
type Repository interface {
	Get(ctx context.Context, id string) (entity.Project, error)
	Create(ctx context.Context, project entity.Project) (string, error)
	FindAll(ctx context.Context) ([]entity.Project, error)
	AddMembers(ctx context.Context, projectID string, members []entity.Member) error
	RemoveMembers(ctx context.Context, projectID string, users []entity.User) error
	UpdateMembersAccessLevel(ctx context.Context, projectID string, users []entity.User, accessLevel entity.AccessLevel) error
	UpdateName(ctx context.Context, projectID, name string) error
	UpdateDescription(ctx context.Context, projectID, description string) error
	SetStarredKGItem(ctx context.Context, projectID, kgItemID string) error
	UnsetStarredKGItem(ctx context.Context, projectID, kgItemID string) error
	UpdateArchived(ctx context.Context, projectID string, archived bool) error
}

// UseCase interface to manage all operations related with projects.
type UseCase interface {
	Create(ctx context.Context, opt CreateProjectOption) (entity.Project, error)
	FindAll(ctx context.Context) ([]entity.Project, error)
	GetByID(ctx context.Context, id string) (entity.Project, error)
	AddMembers(ctx context.Context, opt AddMembersOption) (entity.Project, error)
	RemoveMembers(ctx context.Context, opt RemoveMembersOption) (entity.Project, error)
	UpdateMembers(ctx context.Context, opt UpdateMembersOption) (entity.Project, error)
	Update(ctx context.Context, opt UpdateProjectOption) (entity.Project, error)
	UpdateStarred(ctx context.Context, opt UpdateStarredOption) (bool, error)
}
