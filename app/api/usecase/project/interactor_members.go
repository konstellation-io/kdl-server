package project

import (
	"context"
	"errors"
	"fmt"

	"github.com/konstellation-io/kdl-server/app/api/entity"
)

// UpdateProjectOption options when updating a project member.
type UpdateProjectOption struct {
	ProjectID   string
	Name        *string
	Description *string
	Archived    *bool
}

// UpdateMembersOption options when updating a project member.
type UpdateMembersOption struct {
	ProjectID   string
	Users       []entity.User
	AccessLevel entity.AccessLevel
	LoggedUser  entity.User
}

// RemoveMembersOption options when removing a project member.
type RemoveMembersOption struct {
	ProjectID  string
	Users      []entity.User
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
func (i *interactor) AddMembers(ctx context.Context, opt AddMembersOption) (entity.Project, error) {
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
	for _, u := range opt.Users {
		err = i.giteaService.AddCollaborator(p.Repository.RepoName, u.Username, MemberAccessLevelOnCreation)
		if err != nil {
			return entity.Project{}, err
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

// RemoveMembers removes a user from the given project.
func (i *interactor) RemoveMembers(ctx context.Context, opt RemoveMembersOption) (entity.Project, error) {
	p, err := i.repo.Get(ctx, opt.ProjectID)
	if err != nil {
		return entity.Project{}, err
	}

	// Check the members to remove exist into the project
	for _, u := range opt.Users {
		if ok, _ := i.getMember(u.ID, p.Members); !ok {
			return entity.Project{}, fmt.Errorf("%w: user ID=%s", ErrMemberNotExists, u.ID)
		}
	}

	// Check the logged user is admin in this project
	memberAccessLevel := i.getMemberAccessLevel(opt.LoggedUser.ID, p.Members)
	if memberAccessLevel != entity.AccessLevelAdmin {
		i.logger.Infof("The member \"%s\" has access level \"%s\" and cannot remove members", opt.LoggedUser.Username, memberAccessLevel)
		return entity.Project{}, ErrOnlyAdminCanRemoveMember
	}

	// Check if after removing the user there is at least one administrator
	if !i.checkAtLeastOneAdmin(opt.Users, p.Members) {
		return entity.Project{}, ErrRemoveNoMoreAdmins
	}

	// Remove collaborators from the Gitea repository
	for _, u := range opt.Users {
		err = i.giteaService.RemoveCollaborator(p.Repository.RepoName, u.Username)
		if err != nil {
			return entity.Project{}, err
		}
	}

	// Remove members from stored project in our DataBase
	err = i.repo.RemoveMembers(ctx, opt.ProjectID, opt.Users)
	if err != nil {
		return entity.Project{}, err
	}

	return i.repo.Get(ctx, opt.ProjectID)
}

// UpdateMembers changes the access level for the given member.
func (i *interactor) UpdateMembers(ctx context.Context, opt UpdateMembersOption) (entity.Project, error) {
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

	// Check the members to update exist into the project
	for _, u := range opt.Users {
		if ok, _ := i.getMember(u.ID, p.Members); !ok {
			return entity.Project{}, fmt.Errorf("%w: user ID=%s", ErrMemberNotExists, u.ID)
		}
	}

	// Check if after updating there is at least one administrator
	if opt.AccessLevel != entity.AccessLevelAdmin {
		if !i.checkAtLeastOneAdmin(opt.Users, p.Members) {
			return entity.Project{}, ErrUpdateNoMoreAdmins
		}
	}

	// Update collaborator permissions in Gitea repository
	for _, u := range opt.Users {
		err = i.giteaService.UpdateCollaboratorPermissions(p.Repository.RepoName, u.Username, opt.AccessLevel)
		if err != nil {
			return entity.Project{}, err
		}
	}

	// Update members from stored project in our DataBase
	err = i.repo.UpdateMembersAccessLevel(ctx, opt.ProjectID, opt.Users, opt.AccessLevel)
	if err != nil {
		return entity.Project{}, err
	}

	return i.repo.Get(ctx, opt.ProjectID)
}

// getMemberAccessLevel returns the member access level for the given user.
func (i *interactor) getMemberAccessLevel(userID string, members []entity.Member) entity.AccessLevel {
	var memberAccessLevel entity.AccessLevel

	if ok, m := i.getMember(userID, members); ok {
		memberAccessLevel = m.AccessLevel
	}

	return memberAccessLevel
}

// getMember returns the desired member.
func (i *interactor) getMember(userID string, members []entity.Member) (bool, entity.Member) {
	for _, m := range members {
		if userID == m.UserID {
			return true, m
		}
	}

	return false, entity.Member{}
}

// checkAtLeastOneAdmin indicates if there is at least one admin inside the members ignoring the given users.
func (i *interactor) checkAtLeastOneAdmin(skipUsers []entity.User, members []entity.Member) bool {
	skipUsersMap := make(map[string]struct{}, len(skipUsers))
	for _, u := range skipUsers {
		skipUsersMap[u.ID] = struct{}{}
	}

	for _, m := range members {
		if _, found := skipUsersMap[m.UserID]; found {
			continue
		}

		if m.AccessLevel == entity.AccessLevelAdmin {
			return true
		}
	}

	return false
}
