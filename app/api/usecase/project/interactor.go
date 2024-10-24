package project

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"time"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/droneservice"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/giteaservice"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/k8s"
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
	logger           logging.Logger
	projectRepo      Repository
	userActivityRepo UserActivityRepo
	clock            clock.Clock
	giteaService     giteaservice.GiteaClient
	minioService     minioservice.MinioService
	droneService     droneservice.DroneService
	k8sClient        k8s.Client
}

// InteractorDeps encapsulates all project interactor dependencies.
type InteractorDeps struct {
	Logger           logging.Logger
	Repo             Repository
	UserActivityRepo UserActivityRepo
	Clock            clock.Clock
	GiteaService     giteaservice.GiteaClient
	MinioService     minioservice.MinioService
	DroneService     droneservice.DroneService
	K8sClient        k8s.Client
}

// NewInteractor is a constructor function.
func NewInteractor(deps *InteractorDeps) UseCase {
	return &interactor{
		logger:           deps.Logger,
		projectRepo:      deps.Repo,
		userActivityRepo: deps.UserActivityRepo,
		clock:            deps.Clock,
		giteaService:     deps.GiteaService,
		minioService:     deps.MinioService,
		droneService:     deps.DroneService,
		k8sClient:        deps.K8sClient,
	}
}

/*
Create stores into the DB a new project.
Depending on the repository type:

  - For internal repositories creates a repository in Gitea.
  - For external repositories, mirrors the external repository in Gitea.
  - Create a k8s KDLProject containing a MLFLow instance
  - Create Minio bucket
  - Create Minio folders
  - Activate Drone.io projectRepo.
*/
func (i *interactor) Create(ctx context.Context, opt CreateProjectOption) (entity.Project, error) {
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
	if opt.RepoType == entity.RepositoryTypeExternal {
		if err != nil {
			return entity.Project{}, err
		}

		err := i.giteaService.MirrorRepo(*opt.ExternalRepoURL, repoName, *opt.ExternalRepoUsername, opt.Owner.Username,
			opt.ExternalRepoAuthMethod, opt.ExternalRepoCredential)
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
	err = i.minioService.CreateBucket(ctx, opt.ProjectID)
	if err != nil {
		return entity.Project{}, err
	}

	// Create Minio folders
	err = i.minioService.CreateProjectDirs(ctx, opt.ProjectID)
	if err != nil {
		return entity.Project{}, err
	}

	// Activate Drone.io projectRepo
	err = i.droneService.ActivateRepository(opt.ProjectID)
	if err != nil {
		return entity.Project{}, err
	}

	// Store the project into the database
	insertedID, err := i.projectRepo.Create(ctx, project)
	if err != nil {
		return entity.Project{}, err
	}

	i.logger.Infof("Created a new project %q with ID %q", project.Name, insertedID)

	return i.projectRepo.Get(ctx, insertedID)
}

// FindAll returns all the projects.
func (i *interactor) FindAll(ctx context.Context) ([]entity.Project, error) {
	i.logger.Info("Finding all projects")
	return i.projectRepo.FindAll(ctx)
}

// GetByID returns the project with the desired identifier.
func (i *interactor) GetByID(ctx context.Context, id string) (entity.Project, error) {
	i.logger.Infof("Getting project with id %q", id)
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
		i.logger.Infof("Project %q doesn't exist, skipping", projectID)
		return &entity.Project{}, nil
	} else if err != nil {
		return nil, err
	}

	i.logger.Infof("Attempting to delete project with id %q", projectID)

	accessLevel := i.getMemberAccessLevel(opt.LoggedUser.ID, p.Members)
	if accessLevel != entity.AccessLevelAdmin {
		return nil, ErrWrongAccessLevel
	}

	minioBackup, err := i.minioService.DeleteBucket(ctx, projectID)
	if err != nil {
		return nil, err
	}

	err = i.giteaService.DeleteRepo(p.ID)
	if err != nil {
		return nil, err
	}

	err = i.k8sClient.DeleteKDLProjectCR(ctx, projectID)
	if err != nil {
		return nil, err
	}

	err = i.droneService.DeleteRepository(projectID)
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

	i.logger.Infof("Project with id %q successfully deleted", projectID)

	return &p, nil
}
