package project

import (
	"context"
	"errors"
	"fmt"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/giteaservice"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/minioservice"
	"github.com/konstellation-io/kdl-server/app/api/pkg/clock"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
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

// Interactor implements the UseCase interface.
type Interactor struct {
	logger       logging.Logger
	repo         Repository
	clock        clock.Clock
	giteaService giteaservice.GiteaClient
	minioService minioservice.MinioService
}

// NewInteractor is a constructor function.
func NewInteractor(logger logging.Logger,
	repo Repository,
	c clock.Clock,
	giteaService giteaservice.GiteaClient,
	minioService minioservice.MinioService) *Interactor {
	return &Interactor{logger: logger, repo: repo, clock: c, giteaService: giteaService, minioService: minioService}
}

// Create stores into the DB a new project.
// Depending on the repository type:
//  - For internal repositories creates a repository in Gitea.
func (i *Interactor) Create(ctx context.Context, opt CreateProjectOption) (entity.Project, error) {
	// Validate the creation input
	err := opt.Validate()
	if err != nil {
		return entity.Project{}, err
	}

	project := entity.NewProject(opt.Name, opt.Description)
	project.CreationDate = i.clock.Now()

	// Create repository
	switch opt.RepoType {
	case entity.RepositoryTypeInternal:
		err := i.giteaService.CreateRepo(*opt.InternalRepoName)
		if err != nil {
			return entity.Project{}, err
		}

		project.Repository = entity.Repository{
			Type:             entity.RepositoryTypeInternal,
			InternalRepoName: *opt.InternalRepoName,
		}
	case entity.RepositoryTypeExternal:
		return entity.Project{}, ErrRepoTypeNotImplemented
	}

	// Store the project into the database
	insertedID, err := i.repo.Create(ctx, project)
	if err != nil {
		return entity.Project{}, err
	}

	// Create Minio bucket
	err = i.minioService.CreateBucket(opt.Name)
	if err != nil {
		return entity.Project{}, err
	}

	i.logger.Infof("Created a new project \"%s\" with ID \"%s\"", project.Name, insertedID)

	return i.repo.Get(ctx, insertedID)
}

// Find all projects existing in the server.
func (i Interactor) FindAll(ctx context.Context) ([]entity.Project, error) {
	i.logger.Info("Finding all projects in the server")
	return i.repo.FindAll(ctx)
}
