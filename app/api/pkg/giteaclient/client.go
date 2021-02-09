package giteaclient

import (
	"code.gitea.io/sdk/gitea"

	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
)

type giteaClient struct {
	logger logging.Logger
	client *gitea.Client
}

// NewGiteaClientHTTP is a constructor function.
func NewGiteaClientHTTP(logger logging.Logger, url, adminUser, adminPassword string) (GiteaClient, error) {
	client, err := gitea.NewClient(url, gitea.SetBasicAuth(adminUser, adminPassword))
	if err != nil {
		return nil, err
	}

	return &giteaClient{logger: logger, client: client}, nil
}

// CreateUser creates a new user in Gitea.
func (g *giteaClient) CreateUser(email, username, password string) error {
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
func (g *giteaClient) AddSSHKey(username, publicSSHKey string) error {
	key, _, err := g.client.AdminCreateUserPublicKey(username, gitea.CreateKeyOption{
		Title:    "kdl-ssh-key",
		Key:      publicSSHKey,
		ReadOnly: true,
	})

	if err != nil {
		return err
	}

	g.logger.Infof("Created public SSH key for user \"%s\" in Gitea with id \"%d\"", username, key.ID)

	return nil
}
