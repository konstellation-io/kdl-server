package project

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"time"

	"github.com/go-logr/logr"
	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/k8s"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/minioadminservice"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/minioservice"
	"github.com/konstellation-io/kdl-server/app/api/pkg/clock"
	"github.com/konstellation-io/kdl-server/app/api/pkg/kdlutil"
)

const (
	MemberAccessLevelOnCreation = entity.AccessLevelViewer
)

var (
	ErrCreateProjectValidation = errors.New("create project validation error")
)

// CreateProjectOption options when creating project.
type CreateProjectOption struct {
	ProjectID              string
	Name                   string
	Description            string
	RepoType               entity.RepositoryType
	ExternalRepoURL        *string
	ExternalRepoUsername   *string
	ExternalRepoCredential string
	ExternalRepoAuthMethod entity.RepositoryAuthMethod
	Owner                  entity.User
}

// DeleteProjectOption options when deleting a project.
type DeleteProjectOption struct {
	LoggedUser entity.User
	ProjectID  string
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

		if !c.ExternalRepoAuthMethod.IsValid() {
			return fmt.Errorf("%w: invalid repository authentication method", ErrCreateProjectValidation)
		}

		if c.ExternalRepoCredential == "" {
			return fmt.Errorf("%w: external repository token cannot be null", ErrCreateProjectValidation)
		}
	}

	return nil
}

// interactor implements the UseCase interface.
type interactor struct {
	logger            logr.Logger
	projectRepo       Repository
	userActivityRepo  UserActivityRepo
	clock             clock.Clock
	minioService      minioservice.MinioService
	minioAdminService minioadminservice.MinioAdminInterface
	k8sClient         k8s.ClientInterface
	randomGenerator   kdlutil.RandomGenerator
}

// InteractorDeps encapsulates all project interactor dependencies.
type InteractorDeps struct {
	Logger            logr.Logger
	Repo              Repository
	UserActivityRepo  UserActivityRepo
	Clock             clock.Clock
	MinioService      minioservice.MinioService
	MinioAdminService minioadminservice.MinioAdminInterface
	K8sClient         k8s.ClientInterface
	RandomGenerator   kdlutil.RandomGenerator
}

// NewInteractor is a constructor function.
func NewInteractor(deps *InteractorDeps) UseCase {
	return &interactor{
		logger:            deps.Logger,
		projectRepo:       deps.Repo,
		userActivityRepo:  deps.UserActivityRepo,
		clock:             deps.Clock,
		minioService:      deps.MinioService,
		minioAdminService: deps.MinioAdminService,
		k8sClient:         deps.K8sClient,
		randomGenerator:   deps.RandomGenerator,
	}
}

/*
Create stores into the DB a new project.
Depending on the repository type:

  - Create a k8s KDLProject containing a MLFLow instance
  - Create Minio bucket
  - Create Minio folders
*/
func (i *interactor) Create(ctx context.Context, opt CreateProjectOption) (entity.Project, error) {
	// Validate the creation input
	err := opt.Validate()
	if err != nil {
		return entity.Project{}, err
	}

	now := i.clock.Now()

	// Generate a secret key for the Minio project user
	secretKey, err := i.randomGenerator.GenerateRandomString(20)
	if err != nil {
		return entity.Project{}, err
	}

	project := entity.NewProject(opt.ProjectID, opt.Name, opt.Description)
	project.CreationDate = now
	project.Members = []entity.Member{
		{
			UserID:      opt.Owner.ID,
			AccessLevel: entity.AccessLevelAdmin,
			AddedDate:   now,
		},
	}

	// Set project repository
	project.Repository = entity.Repository{
		Type:            entity.RepositoryTypeExternal,
		ExternalRepoURL: *opt.ExternalRepoURL,
		RepoName:        opt.ProjectID,
	}

	// Create a k8s KDLProject containing a MLFLow instance
	err = i.k8sClient.CreateKDLProjectCR(ctx, opt.ProjectID)
	if err != nil {
		return entity.Project{}, err
	}

	// Create Minio bucket
	err = i.minioService.CreateBucket(ctx, opt.ProjectID)
	if err != nil {
		return entity.Project{}, err
	}

	// Create Minio folders
	err = i.minioService.CreateProjectDirs(ctx, opt.ProjectID)
	if err != nil {
		return entity.Project{}, err
	}

	// Create Minio project user
	err = i.minioAdminService.CreateUser(ctx, opt.ProjectID, secretKey)
	if err != nil {
		return entity.Project{}, err
	}

	// Create Minio policy for the project user
	err = i.minioAdminService.UpdatePolicy(ctx, opt.ProjectID, []string{opt.ProjectID})
	if err != nil {
		return entity.Project{}, err
	}

	// Assign Minio project policy to project user
	err = i.minioAdminService.AssignPolicy(ctx, opt.ProjectID, opt.ProjectID)
	if err != nil {
		return entity.Project{}, err
	}

	// Store the project into the database
	insertedID, err := i.projectRepo.Create(ctx, project)
	if err != nil {
		return entity.Project{}, err
	}

	i.logger.Info("Created a new project", "projectName", project.Name, "projectID", insertedID)

	return i.projectRepo.Get(ctx, insertedID)
}

// FindAll returns all the projects.
func (i *interactor) FindAll(ctx context.Context) ([]entity.Project, error) {
	i.logger.Info("Finding all projects")
	return i.projectRepo.FindAll(ctx)
}

// GetByID returns the project with the desired identifier.
func (i *interactor) GetByID(ctx context.Context, id string) (entity.Project, error) {
	i.logger.Info("Getting project by ID", "projectID", id)
	return i.projectRepo.Get(ctx, id)
}

// Update changes the desired information about a project.
func (i *interactor) Update(ctx context.Context, opt UpdateProjectOption) (entity.Project, error) {
	if !kdlutil.IsNilOrEmpty(opt.Name) {
		err := i.projectRepo.UpdateName(ctx, opt.ProjectID, *opt.Name)
		if err != nil {
			return entity.Project{}, err
		}
	}

	if !kdlutil.IsNilOrEmpty(opt.Description) {
		err := i.projectRepo.UpdateDescription(ctx, opt.ProjectID, *opt.Description)
		if err != nil {
			return entity.Project{}, err
		}
	}

	if opt.Archived != nil {
		err := i.projectRepo.UpdateArchived(ctx, opt.ProjectID, *opt.Archived)
		if err != nil {
			return entity.Project{}, err
		}
	}

	return i.projectRepo.Get(ctx, opt.ProjectID)
}

func (i *interactor) Delete(ctx context.Context, opt DeleteProjectOption) (*entity.Project, error) {
	projectID := opt.ProjectID

	p, err := i.projectRepo.Get(ctx, projectID)
	if errors.Is(err, entity.ErrProjectNotFound) {
		i.logger.Info("Project doesn't exist, skipping", "projectID", projectID)
		return &entity.Project{}, nil
	} else if err != nil {
		return nil, err
	}

	i.logger.Info("Attempting to delete project", "projectID", projectID)

	accessLevel := i.getMemberAccessLevel(opt.LoggedUser.ID, p.Members)
	if accessLevel != entity.AccessLevelAdmin {
		return nil, ErrWrongAccessLevel
	}

	minioBackup, err := i.minioService.DeleteBucket(ctx, projectID)
	if err != nil {
		return nil, err
	}

	err = i.k8sClient.DeleteKDLProjectCR(ctx, projectID)
	if err != nil {
		return nil, err
	}

	err = i.projectRepo.DeleteOne(ctx, projectID)
	if err != nil {
		return nil, err
	}

	deleteRepoActVars := entity.NewActivityVarsDeleteRepo(projectID, minioBackup)
	deleteRepoUserAct := entity.UserActivity{
		Date:   time.Now(),
		UserID: opt.LoggedUser.ID,
		Type:   entity.UserActivityTypeDeleteProject,
		Vars:   deleteRepoActVars,
	}

	err = i.userActivityRepo.Create(ctx, deleteRepoUserAct)
	if err != nil {
		return nil, err
	}

	i.logger.Info("Project with successfully deleted", "projectID", projectID)

	return &p, nil
}
