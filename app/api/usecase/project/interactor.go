package project

import (
	"context"
	"errors"
	"fmt"

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
	ErrRepoTypeNotImplemented  = errors.New("the selected repository type is not implemented")
)

// CreateProjectOption options when creating project.
type CreateProjectOption struct {
	Name             string
	Description      string
	RepoType         entity.RepositoryType
	InternalRepoName *string
	ExternalRepoURL  *string
	Owner            entity.User
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

		// Create Minio bucket
		err = i.minioService.CreateBucket(*opt.InternalRepoName)
		if err != nil {
			return entity.Project{}, err
		}

		// Activate Drone.io repo
		err = i.droneService.ActivateRepository(*opt.InternalRepoName)
		if err != nil {
			return entity.Project{}, err
		}
	case entity.RepositoryTypeExternal:
		return entity.Project{}, ErrRepoTypeNotImplemented
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
