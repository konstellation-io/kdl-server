package project

import (
	"context"
	"errors"
	"fmt"
	"regexp"

	"github.com/konstellation-io/kdl-server/app/api/infrastructure/k8s"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/droneservice"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/giteaservice"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/minioservice"
	"github.com/konstellation-io/kdl-server/app/api/pkg/clock"
	"github.com/konstellation-io/kdl-server/app/api/pkg/kdlutil"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
)

const (
	MemberAccessLevelOnCreation = entity.AccessLevelViewer
)

var (
	ErrCreateProjectValidation = errors.New("create project validation error")
)

// CreateProjectOption options when creating project.
type CreateProjectOption struct {
	ProjectID            string
	Name                 string
	Description          string
	RepoType             entity.RepositoryType
	ExternalRepoURL      *string
	ExternalRepoUsername *string
	ExternalRepoToken    *string
	Owner                entity.User
}

// UpdateStarredOption options when updating starred kgItem.
type UpdateStarredOption struct {
	ProjectID string
	KGItemID  string
	Starred   bool
}

// Validate check that the CreateProjectOption properties are valid.
func (c CreateProjectOption) Validate() error {
	const (
		idMinLen = 3
		idMaxLen = 20
	)

	if c.ProjectID == "" {
		return fmt.Errorf("%w: project id cannot be null", ErrCreateProjectValidation)
	}

	if len(c.ProjectID) < idMinLen {
		return fmt.Errorf("%w: project id length must be greater than %d", ErrCreateProjectValidation, idMinLen)
	}

	if len(c.ProjectID) > idMaxLen {
		return fmt.Errorf("%w: project id length must be lower than %d", ErrCreateProjectValidation, idMaxLen)
	}

	projectIDRegExp := regexp.MustCompile("^[a-z]([-a-z0-9]*[a-z0-9])?$")

	if !projectIDRegExp.MatchString(c.ProjectID) {
		return fmt.Errorf("%w: project id must be lower case and can only contain letters, numbers or hyphens,"+
			" e.g. my-awesome-project", ErrCreateProjectValidation)
	}

	if c.Name == "" {
		return fmt.Errorf("%w: project name cannot be null", ErrCreateProjectValidation)
	}

	if c.Description == "" {
		return fmt.Errorf("%w: project description cannot be null", ErrCreateProjectValidation)
	}

	if !c.RepoType.IsValid() {
		return fmt.Errorf("%w: invalid repository type", ErrCreateProjectValidation)
	}

	if c.RepoType == entity.RepositoryTypeExternal {
		if kdlutil.IsNilOrEmpty(c.ExternalRepoURL) {
			return fmt.Errorf("%w: external repository URL cannot be null", ErrCreateProjectValidation)
		}

		if kdlutil.IsNilOrEmpty(c.ExternalRepoUsername) {
			return fmt.Errorf("%w: external repository username cannot be null", ErrCreateProjectValidation)
		}

		if kdlutil.IsNilOrEmpty(c.ExternalRepoToken) {
			return fmt.Errorf("%w: external repository token cannot be null", ErrCreateProjectValidation)
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
	k8sClient    k8s.K8sClient
}

// NewInteractor is a constructor function.
func NewInteractor(logger logging.Logger,
	repo Repository,
	c clock.Clock,
	giteaService giteaservice.GiteaClient,
	minioService minioservice.MinioService,
	droneService droneservice.DroneService,
	k8sClient k8s.K8sClient,
) UseCase {
	return &interactor{
		logger:       logger,
		repo:         repo,
		clock:        c,
		giteaService: giteaService,
		minioService: minioService,
		droneService: droneService,
		k8sClient:    k8sClient,
	}
}

// Create stores into the DB a new project.
// Depending on the repository type:
//  - For internal repositories creates a repository in Gitea.
//  - For external repositories, mirrors the external repository in Gitea.
//  - Create a k8s KDLProject containing a MLFLow instance
//  - Create Minio bucket
//  - Activate Drone.io repo
func (i interactor) Create(ctx context.Context, opt CreateProjectOption) (entity.Project, error) {
	// Validate the creation input
	err := opt.Validate()
	if err != nil {
		return entity.Project{}, err
	}

	now := i.clock.Now()

	project := entity.NewProject(opt.ProjectID, opt.Name, opt.Description)
	project.CreationDate = now
	project.Members = []entity.Member{
		{
			UserID:      opt.Owner.ID,
			AccessLevel: entity.AccessLevelAdmin,
			AddedDate:   now,
		},
	}
	repoName := opt.ProjectID

	// Create repository
	switch opt.RepoType {
	case entity.RepositoryTypeInternal:
		err := i.giteaService.CreateRepo(repoName, opt.Owner.Username)
		if err != nil {
			return entity.Project{}, err
		}

		project.Repository = entity.Repository{
			Type:     entity.RepositoryTypeInternal,
			RepoName: repoName,
		}

	case entity.RepositoryTypeExternal:
		if err != nil {
			return entity.Project{}, err
		}

		err := i.giteaService.MirrorRepo(*opt.ExternalRepoURL, repoName, *opt.ExternalRepoUsername, *opt.ExternalRepoToken, opt.Owner.Username)
		if err != nil {
			return entity.Project{}, err
		}

		project.Repository = entity.Repository{
			Type:            entity.RepositoryTypeExternal,
			ExternalRepoURL: *opt.ExternalRepoURL,
			RepoName:        repoName,
		}
	}

	// Create a k8s KDLProject containing a MLFLow instance
	err = i.k8sClient.CreateKDLProjectCR(ctx, opt.ProjectID)
	if err != nil {
		return entity.Project{}, err
	}

	// Create Minio bucket
	err = i.minioService.CreateBucket(opt.ProjectID)
	if err != nil {
		return entity.Project{}, err
	}

	// Activate Drone.io repo
	err = i.droneService.ActivateRepository(opt.ProjectID)
	if err != nil {
		return entity.Project{}, err
	}

	// Store the project into the database
	insertedID, err := i.repo.Create(ctx, project)
	if err != nil {
		return entity.Project{}, err
	}

	i.logger.Infof("Created a new project \"%s\" with ID \"%s\"", project.Name, insertedID)

	return i.repo.Get(ctx, insertedID)
}

// FindAll returns all the projects.
func (i interactor) FindAll(ctx context.Context) ([]entity.Project, error) {
	i.logger.Info("Finding all projects")
	return i.repo.FindAll(ctx)
}

// GetByID returns the project with the desired identifier.
func (i interactor) GetByID(ctx context.Context, id string) (entity.Project, error) {
	i.logger.Infof("Getting project with id \"%s\"", id)
	return i.repo.Get(ctx, id)
}

// Update changes the desired information about a project.
func (i interactor) Update(ctx context.Context, opt UpdateProjectOption) (entity.Project, error) {
	if !kdlutil.IsNilOrEmpty(opt.Name) {
		err := i.repo.UpdateName(ctx, opt.ProjectID, *opt.Name)
		if err != nil {
			return entity.Project{}, err
		}
	}

	if !kdlutil.IsNilOrEmpty(opt.Description) {
		err := i.repo.UpdateDescription(ctx, opt.ProjectID, *opt.Description)
		if err != nil {
			return entity.Project{}, err
		}
	}

	if opt.Archived != nil {
		err := i.repo.UpdateArchived(ctx, opt.ProjectID, *opt.Archived)
		if err != nil {
			return entity.Project{}, err
		}
	}

	return i.repo.Get(ctx, opt.ProjectID)
}

// UpdateStarred set/unsets kgItem from starred list.
func (i interactor) UpdateStarred(ctx context.Context, opt UpdateStarredOption) (bool, error) {
	if opt.Starred {
		err := i.repo.SetStarredKGItem(ctx, opt.ProjectID, opt.KGItemID)
		return true, err
	}

	err := i.repo.UnsetStarredKGItem(ctx, opt.ProjectID, opt.KGItemID)

	return false, err
}
