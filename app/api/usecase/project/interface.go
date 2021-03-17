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
	FindByUserID(ctx context.Context, userID string) ([]entity.Project, error)
	AddMembers(ctx context.Context, projectID string, members []entity.Member) error
	RemoveMember(ctx context.Context, projectID, userID string) error
	UpdateMemberAccessLevel(ctx context.Context, projectID, userID string, accessLevel entity.AccessLevel) error
	UpdateName(ctx context.Context, projectID, name string) error
	UpdateDescription(ctx context.Context, projectID, description string) error
}

// UseCase interface to manage all operations related with projects.
type UseCase interface {
	Create(ctx context.Context, opt CreateProjectOption) (entity.Project, error)
	FindByUserID(ctx context.Context, userID string) ([]entity.Project, error)
	GetByID(ctx context.Context, id string) (entity.Project, error)
	AddMembers(ctx context.Context, opt AddMembersOption) (entity.Project, error)
	RemoveMember(ctx context.Context, opt RemoveMemberOption) (entity.Project, error)
	UpdateMember(ctx context.Context, opt UpdateMemberOption) (entity.Project, error)
	Update(ctx context.Context, opt UpdateProjectOption) (entity.Project, error)
}
