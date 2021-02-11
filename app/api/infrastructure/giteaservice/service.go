package giteaservice

import (
	"errors"
	"fmt"

	"code.gitea.io/sdk/gitea"
	"github.com/konstellation-io/kdl-server/app/api/entity"

	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
)

const (
	// The KDL organization and the teams are created during the Gitea installation:
	// https://github.com/konstellation-io/science-toolkit/blob/master/helm/science-toolkit/templates/gitea/init-configmap.yaml
	kdlOrganization = "kdl"
	kdlTeamAdmin    = "admin-users"
	kdlTeamManager  = "manager-users"
	kdlTeamViewer   = "viewer-users"
	kdlSSHKeyName   = "kdl-ssh-key"
)

var (
	ErrTeamNotFound = errors.New("team not found in Gitea")
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
func (g *giteaService) CreateRepo(name, desc string) error {
	repo, _, err := g.client.AdminCreateRepo(kdlOrganization, gitea.CreateRepoOption{
		Name:        name,
		Description: desc,
	})

	if err != nil {
		return err
	}

	g.logger.Infof("Created repository \"%s\" in organization \"%s\" in Gitea with id \"%d\"", name, kdlOrganization, repo.ID)

	return nil
}

// AddTeamMember adds the specified user to a KDL team depending on his access level.
func (g *giteaService) AddTeamMember(username string, accessLevel entity.AccessLevel) error {
	// To add a team member we need to get the team ID
	teams, _, err := g.client.ListOrgTeams(kdlOrganization, gitea.ListTeamsOptions{
		ListOptions: gitea.ListOptions{Page: 0, PageSize: 10},
	})
	if err != nil {
		return err
	}

	var targetTeamName string

	switch accessLevel {
	case entity.AccessLevelAdmin:
		targetTeamName = kdlTeamAdmin
	case entity.AccessLevelManager:
		targetTeamName = kdlTeamManager
	case entity.AccessLevelViewer:
		targetTeamName = kdlTeamViewer
	}

	var targetTeamID int64 = -1

	for _, t := range teams {
		if t.Name == targetTeamName {
			targetTeamID = t.ID
			break
		}
	}

	if targetTeamID == -1 {
		return fmt.Errorf("%w: team \"%s\" not found in \"%s\" organization", ErrTeamNotFound, targetTeamName, kdlOrganization)
	}

	// Using the found team ID add the member
	_, err = g.client.AddTeamMember(targetTeamID, username)
	if err != nil {
		return err
	}

	g.logger.Infof("Added user \"%s\" to team \"%s\" in Gitea", username, targetTeamName)

	return nil
}
