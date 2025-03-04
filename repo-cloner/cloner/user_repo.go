package cloner

import (
	"os"
	"path"
	"strings"
	"time"

	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing/transport/ssh"
	"github.com/go-logr/logr"

	"github.com/konstellation-io/kdl-server/repo-cloner/config"
	"github.com/konstellation-io/kdl-server/repo-cloner/repository"
	"github.com/konstellation-io/kdl-server/repo-cloner/utils"
)

type UserRepoCloner struct {
	projectRepo *repository.ProjectMongoDBRepo
	userRepo    *repository.UserMongoDBRepo
	logger      logr.Logger
	cfg         config.Config
}

func NewUserRepoCloner(
	cfg config.Config,
	logger logr.Logger,
	projectRepo *repository.ProjectMongoDBRepo,
	userRepo *repository.UserMongoDBRepo,
) *UserRepoCloner {
	return &UserRepoCloner{cfg: cfg, logger: logger, projectRepo: projectRepo, userRepo: userRepo}
}

func (c *UserRepoCloner) Start() {
	user := c.getUserAndInitGitConfigs()

	c.checkAndCloneNewRepos(user)

	ticker := time.NewTicker(time.Duration(c.cfg.CheckFrequencySeconds) * time.Second)
	for range ticker.C {
		c.checkAndCloneNewRepos(user)
	}
}

func (c *UserRepoCloner) getUserAndInitGitConfigs() repository.User {
	u, err := c.userRepo.GetUser(c.cfg.UsrName)
	if err != nil {
		c.logger.Error(err, "Error retrieving user", "UserName", c.cfg.UsrName)
		os.Exit(1)
	}

	err = utils.AddGitUserName(u.Username)
	if err != nil {
		c.logger.Error(err, "Error setting git username. You'll need to do manually")
	}

	err = utils.AddGitEmail(u.Email)
	if err != nil {
		c.logger.Error(err, "Error setting git email. You'll need to do manually")
	}

	return u
}

func (c *UserRepoCloner) checkAndCloneNewRepos(user repository.User) {
	projects, err := c.projectRepo.FindUserRepos(user.ID)
	if err != nil {
		c.logger.Error(err, "Error getting user repos")
		return
	}

	projectToClone := make(map[string]repository.Project)

	for _, project := range projects {
		destPath := c.getRepoPath(project)
		if _, err := os.Stat(destPath); !os.IsNotExist(err) {
			continue
		}

		projectToClone[project.ID] = project
	}

	if len(projectToClone) == 0 {
		return
	}

	c.logger.Info("Found new repositories to clone", "TotalRepos", len(projectToClone))

	for _, project := range projectToClone {
		go c.cloneRepo(project)
	}
}

func (c *UserRepoCloner) cloneRepo(project repository.Project) {
	destPath := c.getRepoPath(project)
	repoURL := ""

	repoURL = strings.Replace(project.URL, "https://", "ssh://git@", 1)

	hostname, err := utils.GetRepoHostnameFromURL(project.URL)
	if err != nil {
		c.logger.Error(err, "Error getting the repository hostname from URL", "RepoURL", project.URL)
		return
	}

	err = utils.AddToKnownHost(hostname, c.logger)
	if err != nil {
		c.logger.Error(err, "Error adding hostname to known hosts", "hostname", hostname)
		return
	}

	c.logger.Info("Repository found. Clone starting", "ProjectID", project.ID, "RepoURL", repoURL)

	auth, err := ssh.NewPublicKeysFromFile("git", c.cfg.PemFile, c.cfg.PemFilePassword)
	if err != nil {
		c.logger.Error(err, "Error with rsa key. Aborting clone.")
		return
	}

	_, err = git.PlainClone(destPath, false, &git.CloneOptions{
		URL:      repoURL,
		Progress: os.Stdout,
		Auth:     auth,
	})

	if err != nil {
		c.logger.Error(err, "Error cloning repository")

		if _, err := os.Stat(destPath); os.IsNotExist(err) {
			err := os.RemoveAll(destPath)
			if err != nil {
				c.logger.Error(err, "Error deleting repo folder", "RepoPath", destPath)
			}
		}

		return
	}

	c.logger.Info("Repository successfully created", "ProjectID", project.ID, "RepoURL", repoURL)
}

func (c *UserRepoCloner) getRepoPath(project repository.Project) string {
	return path.Join(c.cfg.ReposPath, project.ID)
}
