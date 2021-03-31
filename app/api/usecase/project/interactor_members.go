package project

import (
	"context"
	"errors"
	"fmt"

	"github.com/konstellation-io/kdl-server/app/api/entity"
)

// UpdateProjectOption options when updating a project member.
type UpdateProjectOption struct {
	ProjectID            string
	Name                 *string
	Description          *string
	Archived             *bool
	RepoType             *entity.RepositoryType
	InternalRepoName     *string
	ExternalRepoURL      *string
	ExternalRepoUsername *string
	ExternalRepoToken    *string
}

// UpdateMemberOption options when updating a project member.
type UpdateMemberOption struct {
	ProjectID   string
	User        entity.User
	AccessLevel entity.AccessLevel
	LoggedUser  entity.User
}

// RemoveMemberOption options when removing a project member.
type RemoveMemberOption struct {
	ProjectID  string
	User       entity.User
	LoggedUser entity.User
}

// AddMembersOption options when removing a project member.
type AddMembersOption struct {
	ProjectID  string
	Users      []entity.User
	LoggedUser entity.User
}

var (
	ErrRemoveNoMoreAdmins       = errors.New("there are not more admin members so the user cannot be removed")
	ErrUpdateNoMoreAdmins       = errors.New("there are not more admin members so the user cannot be updated")
	ErrOnlyAdminCanAddMember    = errors.New("only admins can add members")
	ErrOnlyAdminCanRemoveMember = errors.New("only admins can remove members")
	ErrOnlyAdminCanUpdateMember = errors.New("only admins can update members")
	ErrMemberAlreadyExists      = errors.New("member already exists")
	ErrMemberNotExists          = errors.New("member not exists in the project")
)

// AddMembers adds new users to the given project. These members will have the lowest access level.
func (i interactor) AddMembers(ctx context.Context, opt AddMembersOption) (entity.Project, error) {
	p, err := i.repo.Get(ctx, opt.ProjectID)
	if err != nil {
		return entity.Project{}, err
	}

	// Check the logged user is admin in this project
	memberAccessLevel := i.getMemberAccessLevel(opt.LoggedUser.ID, p.Members)
	if memberAccessLevel != entity.AccessLevelAdmin {
		i.logger.Infof("The member \"%s\" has access level \"%s\" and cannot add new members", opt.LoggedUser.Username, memberAccessLevel)
		return entity.Project{}, ErrOnlyAdminCanAddMember
	}

	// Check that the users are new members
	for _, u := range opt.Users {
		if ok, _ := i.getMember(u.ID, p.Members); ok {
			return entity.Project{}, fmt.Errorf("%w: user ID=%s", ErrMemberAlreadyExists, u.ID)
		}
	}

	// Add collaborators to the Gitea repository
	if p.Repository.Type == entity.RepositoryTypeInternal {
		for _, u := range opt.Users {
			err = i.giteaService.AddCollaborator(p.Repository.InternalRepoName, u.Username, MemberAccessLevelOnCreation)
			if err != nil {
				return entity.Project{}, err
			}
		}
	}

	// Store new members into the DataBase
	now := i.clock.Now()
	newMembers := make([]entity.Member, len(opt.Users))

	for idx, u := range opt.Users {
		newMembers[idx] = entity.Member{
			UserID:      u.ID,
			AccessLevel: MemberAccessLevelOnCreation,
			AddedDate:   now,
		}
	}

	err = i.repo.AddMembers(ctx, opt.ProjectID, newMembers)
	if err != nil {
		return entity.Project{}, err
	}

	return i.repo.Get(ctx, opt.ProjectID)
}

// RemoveMember removes a user from the given project.
func (i interactor) RemoveMember(ctx context.Context, opt RemoveMemberOption) (entity.Project, error) {
	p, err := i.repo.Get(ctx, opt.ProjectID)
	if err != nil {
		return entity.Project{}, err
	}

	// Check the member to remove exists into the project
	if ok, _ := i.getMember(opt.User.ID, p.Members); !ok {
		return entity.Project{}, fmt.Errorf("%w: user ID=%s", ErrMemberNotExists, opt.User.ID)
	}

	// Check the logged user is admin in this project
	memberAccessLevel := i.getMemberAccessLevel(opt.LoggedUser.ID, p.Members)
	if memberAccessLevel != entity.AccessLevelAdmin {
		i.logger.Infof("The member \"%s\" has access level \"%s\" and cannot remove members", opt.LoggedUser.Username, memberAccessLevel)
		return entity.Project{}, ErrOnlyAdminCanRemoveMember
	}

	// Check if after removing the user there is at least one administrator
	if !i.checkAtLeastOneAdmin(opt.User.ID, p.Members) {
		return entity.Project{}, ErrRemoveNoMoreAdmins
	}

	// Remove collaborator from the Gitea repository
	if p.Repository.Type == entity.RepositoryTypeInternal {
		err = i.giteaService.RemoveCollaborator(p.Repository.InternalRepoName, opt.User.Username)
		if err != nil {
			return entity.Project{}, err
		}
	}

	// Remove member from stored project in our DataBase
	err = i.repo.RemoveMember(ctx, opt.ProjectID, opt.User.ID)
	if err != nil {
		return entity.Project{}, err
	}

	return i.repo.Get(ctx, opt.ProjectID)
}

// UpdateMember changes the access level for the given member.
func (i interactor) UpdateMember(ctx context.Context, opt UpdateMemberOption) (entity.Project, error) {
	p, err := i.repo.Get(ctx, opt.ProjectID)
	if err != nil {
		return entity.Project{}, err
	}

	// Check the logged user is admin in this project
	memberAccessLevel := i.getMemberAccessLevel(opt.LoggedUser.ID, p.Members)
	if memberAccessLevel != entity.AccessLevelAdmin {
		i.logger.Infof("The member \"%s\" has access level \"%s\" and cannot update members", opt.LoggedUser.Username, memberAccessLevel)
		return entity.Project{}, ErrOnlyAdminCanUpdateMember
	}

	// Check the member to update exists into the project
	if ok, _ := i.getMember(opt.User.ID, p.Members); !ok {
		return entity.Project{}, fmt.Errorf("%w: user ID=%s", ErrMemberNotExists, opt.User.ID)
	}

	// Check if after updating there is at least one administrator
	if opt.AccessLevel != entity.AccessLevelAdmin {
		if !i.checkAtLeastOneAdmin(opt.User.ID, p.Members) {
			return entity.Project{}, ErrUpdateNoMoreAdmins
		}
	}

	// If the repository is internal, update collaborator permissions in Gitea repository
	if p.Repository.Type == entity.RepositoryTypeInternal {
		err = i.giteaService.UpdateCollaboratorPermissions(p.Repository.InternalRepoName, opt.User.Username, opt.AccessLevel)
		if err != nil {
			return entity.Project{}, err
		}
	}

	// Update member from stored project in our DataBase
	err = i.repo.UpdateMemberAccessLevel(ctx, opt.ProjectID, opt.User.ID, opt.AccessLevel)
	if err != nil {
		return entity.Project{}, err
	}

	return i.repo.Get(ctx, opt.ProjectID)
}

// getMemberAccessLevel returns the member access level for the given user.
func (i interactor) getMemberAccessLevel(userID string, members []entity.Member) entity.AccessLevel {
	var memberAccessLevel entity.AccessLevel

	if ok, m := i.getMember(userID, members); ok {
		memberAccessLevel = m.AccessLevel
	}

	return memberAccessLevel
}

// getMember returns the desired member.
func (i interactor) getMember(userID string, members []entity.Member) (bool, entity.Member) {
	for _, m := range members {
		if userID == m.UserID {
			return true, m
		}
	}

	return false, entity.Member{}
}

// checkAtLeastOneAdmin indicates if there is at least one admin inside the members ignoring the given user.
func (i interactor) checkAtLeastOneAdmin(skipUserID string, members []entity.Member) bool {
	for _, m := range members {
		if m.UserID != skipUserID && m.AccessLevel == entity.AccessLevelAdmin {
			return true
		}
	}

	return false
}
