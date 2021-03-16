package giteaservice

import (
	"code.gitea.io/sdk/gitea"
	"github.com/konstellation-io/kdl-server/app/api/entity"

	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
)

const (
	// The KDL organization is created during the Gitea installation:
	// https://github.com/konstellation-io/science-toolkit/blob/master/helm/science-toolkit/templates/gitea/init-configmap.yaml
	kdlOrganization = "kdl"
	kdlSSHKeyName   = "kdl-ssh-key"
)

type giteaService struct {
	logger logging.Logger
	client *gitea.Client
}

// NewGiteaService is a constructor function.
func NewGiteaService(logger logging.Logger, url, adminUser, adminPassword string) (GiteaClient, error) {
	client, err := gitea.NewClient(url, gitea.SetBasicAuth(adminUser, adminPassword))
	if err != nil {
		return nil, err
	}

	return &giteaService{logger: logger, client: client}, nil
}

// CreateUser creates a new user in Gitea.
func (g *giteaService) CreateUser(email, username, password string) error {
	mustChangePassword := true
	user, _, err := g.client.AdminCreateUser(gitea.CreateUserOption{
		Email:              email,
		Password:           password,
		Username:           username,
		MustChangePassword: &mustChangePassword,
	})

	if err != nil {
		return err
	}

	g.logger.Infof("Created user \"%s\" in Gitea with id \"%d\"", user.UserName, user.ID)

	return nil
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

	g.logger.Infof("Created public SSH key for user \"%s\" in Gitea with id \"%d\"", username, key.ID)

	return nil
}

// CreateRepo creates a repository in the KDL organization.
func (g *giteaService) CreateRepo(name, ownerUsername string) error {
	repo, _, err := g.client.AdminCreateRepo(kdlOrganization, gitea.CreateRepoOption{
		Name:     name,
		AutoInit: true,
	})

	if err != nil {
		return err
	}

	g.logger.Infof("Created repository \"%s\" in organization \"%s\" in Gitea with id \"%d\"", name, kdlOrganization, repo.ID)

	return g.AddCollaborator(name, ownerUsername, entity.AccessLevelAdmin)
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

	g.logger.Infof("Added \"%s\" collaborator to Gitea repository \"%s\" with access level \"%s\"", username, repoName, accessLevel)

	return nil
}

// RemoveCollaborator removes a collaborator from the given repository.
func (g *giteaService) RemoveCollaborator(repoName, username string) error {
	_, err := g.client.DeleteCollaborator(kdlOrganization, repoName, username)
	if err != nil {
		return err
	}

	g.logger.Infof("Removed \"%s\" collaborator from Gitea repository \"%s\"", username, repoName)

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
