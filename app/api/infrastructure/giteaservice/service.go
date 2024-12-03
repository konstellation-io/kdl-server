package giteaservice

import (
	"code.gitea.io/sdk/gitea"
	"github.com/go-logr/logr"
	"github.com/konstellation-io/kdl-server/app/api/entity"
)

const (
	// The KDL organization is created during the Gitea installation:
	// https://github.com/konstellation-io/science-toolkit/blob/master/helm/science-toolkit/templates/gitea/init-configmap.yaml
	kdlOrganization = "kdl"
	kdlSSHKeyName   = "kdl-ssh-key"
)

type giteaService struct {
	logger logr.Logger
	client *gitea.Client
}

// NewGiteaService is a constructor function.
func NewGiteaService(logger logr.Logger, url, adminUser, adminPassword string) (GiteaClient, error) {
	client, err := gitea.NewClient(url, gitea.SetBasicAuth(adminUser, adminPassword))
	if err != nil {
		return nil, err
	}

	return &giteaService{logger: logger, client: client}, nil
}

// AddSSHKey adds a new public SSH key to a user.
func (g *giteaService) AddSSHKey(username, publicSSHKey string) error {
	key, _, err := g.client.AdminCreateUserPublicKey(username, gitea.CreateKeyOption{
		Title:    kdlSSHKeyName,
		Key:      publicSSHKey,
		ReadOnly: true,
	})

	if err != nil {
		return err
	}

	g.logger.Info("Created public SSH key for user in Gitea", "username", username, "keyID", key.ID)

	return nil
}

// UpdateSSHKey updates public SSH key on Gitea for a user.
func (g *giteaService) UpdateSSHKey(username, publicSSHKey string) error {
	userKey, err := g.getUserSSHKey(username)
	if err != nil {
		return err
	}

	if userKey != nil {
		keyID := int(userKey.ID)

		_, err = g.client.AdminDeleteUserPublicKey(username, keyID)
		if err != nil {
			return err
		}

		g.logger.Info("Deleted public SSH key for user in Gitea", "username", username, "keyID", keyID)
	}

	return g.AddSSHKey(username, publicSSHKey)
}

// MirrorRepo creates a mirror of a repository in the KDL organization.
func (g *giteaService) MirrorRepo(url, repoName, userName, ownerUsername string, authMethod entity.RepositoryAuthMethod,
	userCredential string) error {
	migrateOpts := gitea.MigrateRepoOption{
		RepoOwner:    kdlOrganization,
		RepoName:     repoName,
		CloneAddr:    url,
		AuthUsername: userName,
		Mirror:       true,
		Private:      true,
	}

	// set authToken or authPassword depending on the received params
	if authMethod == entity.RepositoryAuthToken {
		migrateOpts.AuthToken = userCredential
	} else {
		migrateOpts.AuthPassword = userCredential
	}

	repo, _, err := g.client.MigrateRepo(migrateOpts)

	if err != nil {
		return err
	}

	g.logger.Info("Mirrored repository", "originURL", url, "organization", kdlOrganization, "repoID", repo.ID)

	return g.AddCollaborator(repoName, ownerUsername, entity.AccessLevelAdmin)
}

// DeleteRepo deletes an existing repo from Gitea.
func (g *giteaService) DeleteRepo(repoName string) error {
	_, err := g.client.DeleteRepo(kdlOrganization, repoName)
	if err != nil {
		g.logger.Error(err, "Could not delete Gitea repository", "repoName", repoName)
		return err
	}

	g.logger.Info("Deleted Gitea repository", "repoName", repoName)

	return err
}

// AddCollaborator adds a new collaborator to the given repository.
func (g *giteaService) AddCollaborator(repoName, username string, accessLevel entity.AccessLevel) error {
	var accessMode gitea.AccessMode

	switch accessLevel {
	case entity.AccessLevelAdmin:
		accessMode = gitea.AccessModeAdmin
	case entity.AccessLevelManager:
		accessMode = gitea.AccessModeWrite
	case entity.AccessLevelViewer:
		accessMode = gitea.AccessModeRead
	}

	_, err := g.client.AddCollaborator(kdlOrganization, repoName, username, gitea.AddCollaboratorOption{
		Permission: &accessMode,
	})

	if err != nil {
		return err
	}

	g.logger.Info("Added collaborator to Gitea repository", "newCollaborator", username, "repoName", repoName, "accessLevel", accessLevel)

	return nil
}

// RemoveCollaborator removes a collaborator from the given repository.
func (g *giteaService) RemoveCollaborator(repoName, username string) error {
	_, err := g.client.DeleteCollaborator(kdlOrganization, repoName, username)
	if err != nil {
		return err
	}

	g.logger.Info("Removed collaborator from Gitea repository", "collaborator", username, "repoName", repoName)

	return nil
}

// UpdateCollaboratorPermissions changes the permissions for the given collaborator.
func (g *giteaService) UpdateCollaboratorPermissions(repoName, username string, newAccessLevel entity.AccessLevel) error {
	err := g.RemoveCollaborator(repoName, username)
	if err != nil {
		return err
	}

	return g.AddCollaborator(repoName, username, newAccessLevel)
}

// UpdateUserPermissions changes the permissions for the given user.
func (g *giteaService) UpdateUserPermissions(username string, level entity.AccessLevel) error {
	isAdmin := false

	if level == entity.AccessLevelAdmin {
		isAdmin = true
	}

	// gitea AdminEditUser call requires Email and LoginName in editUserOptions to work properly
	editUserOptions := gitea.EditUserOption{
		LoginName: username,
		Admin:     &isAdmin,
	}

	_, err := g.client.AdminEditUser(username, editUserOptions)
	if err != nil {
		return err
	}

	return nil
}

// FindAllUsers returns all users from Gitea.
func (g *giteaService) FindAllUsers() ([]entity.User, error) {
	const pageSize = 40

	var result []entity.User

	page := 0
	lastNumberOfUsers := 0

	for moreResults := true; moreResults; moreResults = lastNumberOfUsers == pageSize {
		g.logger.Info("Request users from Gitea", "pageNumber", page, "pageSize", pageSize)

		users, _, err := g.client.AdminListUsers(gitea.AdminListUsersOptions{
			ListOptions: gitea.ListOptions{
				Page:     page,
				PageSize: pageSize,
			},
		})

		if err != nil {
			return nil, err
		}

		for _, u := range users {
			result = append(result, entity.User{
				Username: u.UserName,
				Email:    u.Email,
			})
		}

		lastNumberOfUsers = len(users)

		g.logger.Info("There are users in the page", "nOfUsers", lastNumberOfUsers, "pageNumber", page)

		page++
	}

	g.logger.Info("Downloaded users from Gitea", "nOfUsers", len(result))

	return result, nil
}

// getUserSSHKey gets the user SSH key.
func (g *giteaService) getUserSSHKey(username string) (*gitea.PublicKey, error) {
	keys, _, err := g.client.ListPublicKeys(username, gitea.ListPublicKeysOptions{})
	if err != nil {
		return nil, err
	}

	for _, key := range keys {
		if key.Title == kdlSSHKeyName {
			return key, nil
		}
	}

	return nil, nil
}
