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
	ProjectID   string
	Name        string
	Description string
	URL         *string
	Username    *string
	Owner       entity.User
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

	if kdlutil.IsNilOrEmpty(c.URL) {
		return fmt.Errorf("%w: repository URL cannot be null", ErrCreateProjectValidation)
	}

	if kdlutil.IsNilOrEmpty(c.Username) {
		return fmt.Errorf("%w: repository username cannot be null", ErrCreateProjectValidation)
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

// NewInteractor is a constructor function.
func NewInteractor(
	logger logr.Logger,
	k8sClient k8s.ClientInterface,
	minioService minioservice.MinioService,
	minioAdminService minioadminservice.MinioAdminInterface,
	realClock clock.Clock,
	projectRepo Repository,
	userActivityRepo UserActivityRepo,
	randomGenerator kdlutil.RandomGenerator,
) UseCase {
	return &interactor{
		logger:            logger,
		projectRepo:       projectRepo,
		userActivityRepo:  userActivityRepo,
		clock:             realClock,
		minioService:      minioService,
		minioAdminService: minioAdminService,
		k8sClient:         k8sClient,
		randomGenerator:   randomGenerator,
	}
}

/*
Create stores into the DB a new project.
Depending on the repository type:

  - Create a k8s KDLProject containing a MLFLow instance
  - Create Minio bucket
  - Create Minio folders
  - Create Minio project user
  - Create Minio policy for the project user
*/
func (i *interactor) Create(ctx context.Context, opt CreateProjectOption) (entity.Project, error) {
	// Validate the creation input
	err := opt.Validate()
	if err != nil {
		return entity.Project{}, err
	}

	now := i.clock.Now()

	// Generate an access key for the Minio project user
	accessKey := fmt.Sprintf("project-%s", opt.ProjectID)

	// Generate a secret key for the Minio project user
	secretKey, err := i.randomGenerator.GenerateRandomString(40)
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
	project.MinioAccessKey = entity.MinioAccessKey{
		AccessKey: accessKey,
		SecretKey: secretKey,
	}

	// Set project repository
	project.Repository = entity.Repository{
		URL:      *opt.URL,
		RepoName: opt.ProjectID,
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
	err = i.minioAdminService.CreateUser(ctx, accessKey, secretKey)
	if err != nil {
		return entity.Project{}, err
	}

	// Create Minio policy for the project user
	err = i.minioAdminService.UpdatePolicy(ctx, accessKey, []string{opt.ProjectID})
	if err != nil {
		return entity.Project{}, err
	}

	// Assign Minio project policy to project user
	err = i.minioAdminService.AssignPolicy(ctx, accessKey, accessKey)
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

	// Determine policy/user name
	accessKey := fmt.Sprintf("project-%s", projectID)

	err = i.minioAdminService.DeletePolicy(ctx, accessKey)
	if err != nil {
		return nil, err
	}

	err = i.minioAdminService.DeleteUser(ctx, accessKey)
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

func (i *interactor) UpdateKDLProjects(ctx context.Context) error {
	// get the CRD template from the ConfigMap
	configMap, err := i.k8sClient.GetConfigMap(ctx, i.k8sClient.GetConfigMapTemplateNameKDLProject())
	if err != nil {
		return err
	}
	// get the CRD template converted from yaml to go object from the ConfigMap
	crd, err := kdlutil.GetCrdTemplateFromConfigMap(configMap)
	if err != nil {
		return err
	}

	// get all the KDL Projects in the namespace and iterate over to update them
	kdlProjectName, err := i.k8sClient.ListKDLProjectsNameCR(ctx)
	if err != nil {
		return err
	}

	for _, pID := range kdlProjectName {
		// NOTE: update method below to add a new struct with extra data to update into CRD
		err = i.k8sClient.UpdateKDLProjectsCR(ctx, pID, &crd)
		if err != nil {
			i.logger.Error(err, "Error updating KDL Project CR in k8s", "projectName", pID)
		}
	}

	return nil
}
