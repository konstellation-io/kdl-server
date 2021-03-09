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

func (d *droneService) ActivateRepository(repoName string) error {
	d.logger.Infof("Activating \"%s\" repository in Drone...", repoName)

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
