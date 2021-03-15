package project

import (
	"context"
	"errors"
	"fmt"
	"regexp"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/droneservice"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/giteaservice"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/minioservice"
	"github.com/konstellation-io/kdl-server/app/api/pkg/clock"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
)

const (
	MemberAccessLevelOnCreation = entity.AccessLevelViewer
)

var (
	ErrCreateProjectValidation = errors.New("create project validation error")
	// This regexp extracts the repository name from a https URL like:
	//  https://github.com/konstellation-io/kre.git
	repoNameRegexp    = regexp.MustCompile(`([^/]+)\.git$`)
	ErrInvalidRepoURL = errors.New("the repository URL is invalid")
)

// CreateProjectOption options when creating project.
type CreateProjectOption struct {
	Name                 string
	Description          string
	RepoType             entity.RepositoryType
	InternalRepoName     *string
	ExternalRepoURL      *string
	ExternalRepoUsername *string
	ExternalRepoPassword *string
	Owner                entity.User
}

// Validate check that the CreateProjectOption properties are valid.
func (c CreateProjectOption) Validate() error {
	if c.Name == "" {
		return fmt.Errorf("%w: project name cannot be null", ErrCreateProjectValidation)
	}

	if c.Description == "" {
		return fmt.Errorf("%w: project description cannot be null", ErrCreateProjectValidation)
	}

	if !c.RepoType.IsValid() {
		return fmt.Errorf("%w: invalid repository type", ErrCreateProjectValidation)
	}

	if c.RepoType == entity.RepositoryTypeInternal {
		if c.InternalRepoName == nil {
			return fmt.Errorf("%w: internal repository name cannot be null", ErrCreateProjectValidation)
		}
	}

	if c.RepoType == entity.RepositoryTypeExternal {
		if c.ExternalRepoURL == nil {
			return fmt.Errorf("%w: external repository URL cannot be null", ErrCreateProjectValidation)
		}
	}

	return nil
}

// interactor implements the UseCase interface.
type interactor struct {
	logger       logging.Logger
	repo         Repository
	clock        clock.Clock
	giteaService giteaservice.GiteaClient
	minioService minioservice.MinioService
	droneService droneservice.DroneService
}

// NewInteractor is a constructor function.
func NewInteractor(logger logging.Logger,
	repo Repository,
	c clock.Clock,
	giteaService giteaservice.GiteaClient,
	minioService minioservice.MinioService,
	droneService droneservice.DroneService,
) UseCase {
	return &interactor{
		logger:       logger,
		repo:         repo,
		clock:        c,
		giteaService: giteaService,
		minioService: minioService,
		droneService: droneService,
	}
}

// Create stores into the DB a new project.
// Depending on the repository type:
//  - For internal repositories creates a repository in Gitea.
//  - For external repositories, mirrors the external repository in Gitea.
//  - Create Minio bucket
//  - Activate Drone.io repo
func (i *interactor) Create(ctx context.Context, opt CreateProjectOption) (entity.Project, error) {
	// Validate the creation input
	err := opt.Validate()
	if err != nil {
		return entity.Project{}, err
	}

	now := i.clock.Now()

	project := entity.NewProject(opt.Name, opt.Description)
	project.CreationDate = now
	project.Members = []entity.Member{
		{
			UserID:      opt.Owner.ID,
			AccessLevel: entity.AccessLevelAdmin,
			AddedDate:   now,
		},
	}
	repoName := ""

	// Create repository
	switch opt.RepoType {
	case entity.RepositoryTypeInternal:
		err := i.giteaService.CreateRepo(*opt.InternalRepoName, opt.Owner.Username)
		if err != nil {
			return entity.Project{}, err
		}

		project.Repository = entity.Repository{
			Type:             entity.RepositoryTypeInternal,
			InternalRepoName: *opt.InternalRepoName,
		}

		repoName = *opt.InternalRepoName

	case entity.RepositoryTypeExternal:
		err := i.giteaService.MirrorRepo(*opt.ExternalRepoURL, opt.Name, *opt.ExternalRepoUsername, *opt.ExternalRepoPassword)
		if err != nil {
			return entity.Project{}, err
		}

		project.Repository = entity.Repository{
			Type:            entity.RepositoryTypeExternal,
			ExternalRepoURL: *opt.ExternalRepoURL,
		}

		repoName, err = getRepoNameFromURL(*opt.ExternalRepoURL)
		if err != nil {
			return entity.Project{}, err
		}
	}

	// Create Minio bucket
	err = i.minioService.CreateBucket(repoName)
	if err != nil {
		return entity.Project{}, err
	}

	// Activate Drone.io repo
	err = i.droneService.ActivateRepository(repoName)
	if err != nil {
		return entity.Project{}, err
	}

	// Store the project into the database
	insertedID, err := i.repo.Create(ctx, project)
	if err != nil {
		i.logger.Errorf("Unexpected error saving project into DB: %s", err)
		return entity.Project{}, err
	}

	i.logger.Infof("Created a new project \"%s\" with ID \"%s\"", project.Name, insertedID)

	return i.repo.Get(ctx, insertedID)
}

// FindByUserID returns the projects that the given user belongs to.
func (i interactor) FindByUserID(ctx context.Context, userID string) ([]entity.Project, error) {
	i.logger.Infof("Finding projects for the user \"%s\"", userID)
	return i.repo.FindByUserID(ctx, userID)
}

// GetByID returns the project with the desired identifier.
func (i interactor) GetByID(ctx context.Context, id string) (entity.Project, error) {
	i.logger.Infof("Getting project with id \"%s\"", id)
	return i.repo.Get(ctx, id)
}

// getRepoNameFromURL extracts the name of the repo from the external repo url.
func getRepoNameFromURL(url string) (string, error) {
	const expectedMatches = 2

	matches := repoNameRegexp.FindStringSubmatch(url)
	if len(matches) != expectedMatches {
		return "", ErrInvalidRepoURL
	}

	return matches[1], nil
}

// Update changes the desired information about a project.
func (i interactor) Update(ctx context.Context, opt UpdateProjectOption) (entity.Project, error) {
	if opt.Name != nil && *opt.Name != "" {
		err := i.repo.UpdateName(ctx, opt.ProjectID, *opt.Name)
		if err != nil {
			return entity.Project{}, err
		}
	}

	if opt.Description != nil && *opt.Description != "" {
		err := i.repo.UpdateDescription(ctx, opt.ProjectID, *opt.Description)
		if err != nil {
			return entity.Project{}, err
		}
	}

	return i.repo.Get(ctx, opt.ProjectID)
}
