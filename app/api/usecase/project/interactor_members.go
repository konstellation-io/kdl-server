package project

import (
	"context"
	"fmt"

	"github.com/konstellation-io/kdl-server/app/api/entity"
)

// AddMembers adds new users to the given project. These members will have the lowest access level.
func (i interactor) AddMembers(ctx context.Context, projectID string, users []entity.User, loggedUser entity.User) (entity.Project, error) {
	p, err := i.repo.Get(ctx, projectID)
	if err != nil {
		return entity.Project{}, err
	}

	// Check the logged user is admin in this project
	memberAccessLevel := i.getMemberAccessLevel(loggedUser.ID, p.Members)
	if memberAccessLevel != entity.AccessLevelAdmin {
		i.logger.Infof("The member \"%s\" has access level \"%s\" and cannot add new members", loggedUser.Username, memberAccessLevel)
		return entity.Project{}, ErrOnlyAdminCanAddMember
	}

	// Check that the users are new members
	for _, u := range users {
		if ok, _ := i.getMember(u.ID, p.Members); ok {
			return entity.Project{}, fmt.Errorf("%w: user ID=%s", ErrMemberAlreadyExists, u.ID)
		}
	}

	// Add collaborators to the Gitea repository
	if p.Repository.Type == entity.RepositoryTypeInternal {
		for _, u := range users {
			err = i.giteaService.AddCollaborator(p.Repository.InternalRepoName, u.Username, MemberAccessLevelOnCreation)
			if err != nil {
				return entity.Project{}, err
			}
		}
	}

	// Store new members into the DataBase
	now := i.clock.Now()
	newMembers := make([]entity.Member, len(users))

	for idx, u := range users {
		newMembers[idx] = entity.Member{
			UserID:      u.ID,
			AccessLevel: MemberAccessLevelOnCreation,
			AddedDate:   now,
		}
	}

	err = i.repo.AddMembers(ctx, projectID, newMembers)
	if err != nil {
		return entity.Project{}, err
	}

	return i.repo.Get(ctx, projectID)
}

// RemoveMember removes a user from the given project.
func (i interactor) RemoveMember(ctx context.Context, projectID string, u, loggedUser entity.User) (entity.Project, error) {
	p, err := i.repo.Get(ctx, projectID)
	if err != nil {
		return entity.Project{}, err
	}

	// Check the member to remove exists into the project
	if ok, _ := i.getMember(u.ID, p.Members); !ok {
		return entity.Project{}, fmt.Errorf("%w: user ID=%s", ErrMemberNotExists, u.ID)
	}

	// Check the logged user is admin in this project
	memberAccessLevel := i.getMemberAccessLevel(loggedUser.ID, p.Members)
	if memberAccessLevel != entity.AccessLevelAdmin {
		i.logger.Infof("The member \"%s\" has access level \"%s\" and cannot remove members", loggedUser.Username, memberAccessLevel)
		return entity.Project{}, ErrOnlyAdminCanRemoveMember
	}

	// Remove collaborator from the Gitea repository
	if p.Repository.Type == entity.RepositoryTypeInternal {
		err = i.giteaService.RemoveCollaborator(p.Repository.InternalRepoName, u.Username)
		if err != nil {
			return entity.Project{}, err
		}
	}

	// Remove member from stored project in our DataBase
	err = i.repo.RemoveMember(ctx, projectID, u.ID)
	if err != nil {
		return entity.Project{}, err
	}

	return i.repo.Get(ctx, projectID)
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
