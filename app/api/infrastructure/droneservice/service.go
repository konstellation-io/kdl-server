package droneservice

import (
	"context"
	"fmt"
	"log"

	"github.com/drone/drone-go/drone"
	"golang.org/x/oauth2"

	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
)

const repoOrg = "kdl"

type droneService struct {
	logger logging.Logger
	client drone.Client
}

// NewDroneService is a constructor function.
func NewDroneService(logger logging.Logger, url, token string) DroneService {
	config := new(oauth2.Config)
	auth := config.Client(
		context.Background(),
		&oauth2.Token{
			AccessToken: token,
		},
	)

	// create the drone client with authenticator
	client := drone.NewClient(url, auth)

	return &droneService{
		logger: logger,
		client: client,
	}
}

// ActivateRepository activates a repository in drone.
func (d *droneService) ActivateRepository(repoName string) error {
	d.logger.Infof("Activating %q repository in Drone...", repoName)

	repos, err := d.client.RepoListSync()
	if err != nil {
		return fmt.Errorf("fail to sync user repos: %w", err)
	}

	var repo *drone.Repo

	for _, r := range repos {
		if r.Name == repoName {
			repo = r
			break
		}
	}

	if repo == nil {
		log.Fatal("Repos not found")
	}

	_, err = d.client.RepoEnable(repoOrg, repoName)
	if err != nil {
		return fmt.Errorf("fail to activate repo: %w", err)
	}

	trusted := true

	var timeout int64 = 4320 // 3 days

	_, err = d.client.RepoUpdate(repoOrg, repoName, &drone.RepoPatch{Trusted: &trusted, Timeout: &timeout})
	if err != nil {
		return fmt.Errorf("fail to patch repo: %w", err)
	}

	return nil
}

// DeleteRepository deletes a repository in drone.
func (d *droneService) DeleteRepository(repoName string) error {
	d.logger.Infof("Deleting %q repository in Drone...", repoName)

	err := d.client.RepoDelete(repoOrg, repoName)
	if err != nil {
		d.logger.Error(err.Error())
		return fmt.Errorf("error deleting repo: %w", err)
	}

	return nil
}
