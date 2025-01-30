package project_test

import (
	"context"
	"errors"
	"strconv"
	"testing"
	"time"

	"bou.ke/monkey"
	"github.com/go-logr/logr"
	"github.com/go-logr/zapr"
	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
	"gotest.tools/v3/assert"
	v1 "k8s.io/api/core/v1"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/k8s"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/minioadminservice"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/minioservice"
	"github.com/konstellation-io/kdl-server/app/api/pkg/clock"
	"github.com/konstellation-io/kdl-server/app/api/pkg/kdlutil"
	"github.com/konstellation-io/kdl-server/app/api/usecase/project"
)

const (
	testProjectID     = "test-project"
	templateConfigMap = "template-name-project"
)

var (
	errUpdatingCrd  = errors.New("error updating crd")
	errNoConfigMap  = errors.New("no configmap")
	errListProjects = errors.New("error listing projects")
)

type projectSuite struct {
	ctrl       *gomock.Controller
	interactor project.UseCase
	mocks      projectMocks
}

type projectMocks struct {
	repo              *project.MockRepository
	userActivityRepo  *project.MockUserActivityRepo
	clock             *clock.MockClock
	minioService      *minioservice.MockMinioService
	minioAdminService *minioadminservice.MockMinioAdminInterface
	k8sClient         *k8s.MockClientInterface
	logger            logr.Logger
	randomGenerator   *kdlutil.MockRandomGenerator
}

func newProjectSuite(t *testing.T) *projectSuite {
	ctrl := gomock.NewController(t)
	repo := project.NewMockRepository(ctrl)
	userActivityRepo := project.NewMockUserActivityRepo(ctrl)
	clockMock := clock.NewMockClock(ctrl)
	minioService := minioservice.NewMockMinioService(ctrl)
	minioAdminService := minioadminservice.NewMockMinioAdminInterface(ctrl)
	k8sClient := k8s.NewMockClientInterface(ctrl)
	randomGenerator := kdlutil.NewMockRandomGenerator(ctrl)

	zapLog, err := zap.NewDevelopment()
	require.NoError(t, err)

	logger := zapr.NewLogger(zapLog)

	interactor := project.NewInteractor(logger, k8sClient, minioService, minioAdminService, clockMock, repo, userActivityRepo, randomGenerator)

	return &projectSuite{
		ctrl:       ctrl,
		interactor: interactor,
		mocks: projectMocks{
			logger:            logger,
			repo:              repo,
			userActivityRepo:  userActivityRepo,
			clock:             clockMock,
			minioService:      minioService,
			minioAdminService: minioAdminService,
			k8sClient:         k8sClient,
			randomGenerator:   randomGenerator,
		},
	}
}

func TestInteractor_Create(t *testing.T) {
	s := newProjectSuite(t)
	defer s.ctrl.Finish()

	const (
		projectName           = "The Project Y"
		projectDesc           = "The Project Y Description"
		projectMinioAccessKey = "project-test-project" // derived from project ID
		projectMinioSecretKey = "projectY123"
		ownerUserID           = "user.1234"
		ownerUsername         = "john"
	)

	url := "https://github.com/org/repo.git"
	username := "username"

	ctx := context.Background()
	now := time.Now().UTC()

	createProject := entity.NewProject(testProjectID, projectName, projectDesc)
	createProject.CreationDate = now
	createProject.Members = []entity.Member{
		{
			UserID:      ownerUserID,
			AccessLevel: entity.AccessLevelAdmin,
			AddedDate:   now,
		},
	}
	createProject.Repository = entity.Repository{
		URL:      url,
		RepoName: testProjectID,
	}
	createProject.MinioAccessKey = entity.MinioAccessKey{
		AccessKey: projectMinioAccessKey,
		SecretKey: projectMinioSecretKey,
	}

	expectedProject := entity.Project{
		ID:           testProjectID,
		Name:         projectName,
		Description:  projectDesc,
		CreationDate: now,
		Repository: entity.Repository{
			URL:      url,
			RepoName: testProjectID,
		},
		MinioAccessKey: entity.MinioAccessKey{
			AccessKey: projectMinioAccessKey,
			SecretKey: projectMinioSecretKey,
		},
	}

	userActivity := entity.UserActivity{
		Date:   now,
		UserID: ownerUserID,
		Type:   entity.UserActivityTypeCreateProject,
		Vars: []entity.UserActivityVar{
			{
				Key:   "PROJECT_ID",
				Value: testProjectID,
			},
			{
				Key:   "USER_ID",
				Value: ownerUserID,
			},
		},
	}

	s.mocks.clock.EXPECT().Now().Return(now)
	s.mocks.k8sClient.EXPECT().CreateKDLProjectCR(ctx,
		k8s.ProjectData{ProjectID: testProjectID, MinioAccessKey: createProject.MinioAccessKey}).Return(nil)
	s.mocks.minioService.EXPECT().CreateBucket(ctx, testProjectID).Return(nil)
	s.mocks.minioService.EXPECT().CreateProjectDirs(ctx, testProjectID).Return(nil)
	s.mocks.repo.EXPECT().Create(ctx, createProject).Return(testProjectID, nil)
	s.mocks.clock.EXPECT().Now().Return(now)
	s.mocks.userActivityRepo.EXPECT().Create(ctx, userActivity).Return(nil)
	s.mocks.repo.EXPECT().Get(ctx, testProjectID).Return(expectedProject, nil)
	s.mocks.randomGenerator.EXPECT().GenerateRandomString(40).Return(projectMinioSecretKey, nil)
	s.mocks.minioAdminService.EXPECT().CreateProjectUser(ctx, testProjectID, projectMinioSecretKey).Return(projectMinioAccessKey, nil)
	s.mocks.minioAdminService.EXPECT().CreateProjectPolicy(ctx, testProjectID).Return(nil)

	createdProject, err := s.interactor.Create(ctx, project.CreateProjectOption{
		ProjectID:   testProjectID,
		Name:        projectName,
		Description: projectDesc,
		URL:         &url,
		Username:    &username,
		Owner:       entity.User{ID: ownerUserID, Username: ownerUsername},
	})

	require.NoError(t, err)
	require.Equal(t, expectedProject, createdProject)
}

func TestInteractor_FindByUserID(t *testing.T) {
	s := newProjectSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()
	expectedProjects := []entity.Project{
		entity.NewProject(testProjectID, "project-x", "Project X"),
	}

	s.mocks.repo.EXPECT().FindAll(ctx).Return(expectedProjects, nil)

	p, err := s.interactor.FindAll(ctx)

	require.NoError(t, err)
	require.Equal(t, expectedProjects, p)
}

func TestInteractor_GetByID(t *testing.T) {
	s := newProjectSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()
	expectedProject := entity.NewProject(testProjectID, "project-x", "Project X")

	s.mocks.repo.EXPECT().Get(ctx, testProjectID).Return(expectedProject, nil)

	p, err := s.interactor.GetByID(ctx, testProjectID)

	require.NoError(t, err)
	require.Equal(t, expectedProject, p)
}

func TestInteractor_AddMembers(t *testing.T) {
	s := newProjectSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()
	now := time.Now().UTC()

	loggedUser := entity.User{
		ID:       "logged.user.1234",
		Username: "logged_user",
	}

	adminMember := entity.Member{
		UserID: loggedUser.ID, AccessLevel: entity.AccessLevelAdmin, AddedDate: time.Now().UTC(),
	}

	p := entity.NewProject(testProjectID, "project-x", "Project X")
	p.ID = testProjectID
	p.Members = []entity.Member{adminMember}
	p.Repository = entity.Repository{
		RepoName: "repo-A",
	}

	usersToAdd := []entity.User{
		{ID: "userA", Username: "user_a"},
		{ID: "userB", Username: "user_b"},
	}

	newMembers := []entity.Member{
		{UserID: usersToAdd[0].ID, AccessLevel: project.MemberAccessLevelOnCreation, AddedDate: now},
		{UserID: usersToAdd[1].ID, AccessLevel: project.MemberAccessLevelOnCreation, AddedDate: now},
	}

	expectedProject := entity.NewProject(testProjectID, p.Name, p.Description)
	expectedProject.Repository = p.Repository
	expectedProject.Members = []entity.Member{adminMember, newMembers[0], newMembers[1]}
	expectedAddMemberActVars := [][]entity.UserActivityVar{
		{
			{
				Key:   "PROJECT_ID",
				Value: p.ID,
			},
			{
				Key:   "USER_ID",
				Value: usersToAdd[0].ID,
			},
		},
		{
			{
				Key:   "PROJECT_ID",
				Value: p.ID,
			},
			{
				Key:   "USER_ID",
				Value: usersToAdd[1].ID,
			},
		},
	}

	s.mocks.repo.EXPECT().Get(ctx, p.ID).Return(p, nil)
	s.mocks.clock.EXPECT().Now().Return(now)
	s.mocks.repo.EXPECT().AddMembers(ctx, p.ID, newMembers).Return(nil)
	s.mocks.userActivityRepo.EXPECT().Create(
		ctx,
		entity.UserActivity{
			Date:   now,
			UserID: loggedUser.ID,
			Type:   entity.UserActivityTypeAddMember,
			Vars:   expectedAddMemberActVars[0],
		},
	).Return(nil)
	s.mocks.userActivityRepo.EXPECT().Create(
		ctx,
		entity.UserActivity{
			Date:   now,
			UserID: loggedUser.ID,
			Type:   entity.UserActivityTypeAddMember,
			Vars:   expectedAddMemberActVars[1],
		},
	).Return(nil)
	s.mocks.repo.EXPECT().Get(ctx, p.ID).Return(expectedProject, nil)
	s.mocks.minioAdminService.EXPECT().JoinProject(ctx, "user-a", testProjectID).Return(nil)
	s.mocks.minioAdminService.EXPECT().JoinProject(ctx, "user-b", testProjectID).Return(nil)

	p, err := s.interactor.AddMembers(ctx, project.AddMembersOption{
		ProjectID:  p.ID,
		Users:      usersToAdd,
		LoggedUser: loggedUser,
	})

	require.NoError(t, err)
	assert.DeepEqual(t, p, expectedProject)
}

func TestInteractor_RemoveMembers(t *testing.T) {
	s := newProjectSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()
	now := time.Now().UTC()

	loggedUser := entity.User{
		ID:       "logged.user.1234",
		Username: "logged_user",
	}

	adminMember := entity.Member{
		UserID: loggedUser.ID, AccessLevel: entity.AccessLevelAdmin, AddedDate: time.Now().UTC(),
	}

	usersToRemove := []entity.User{
		{ID: "userA", Username: "user_a"},
		{ID: "userB", Username: "user_b"},
	}

	p := entity.NewProject(testProjectID, "project-x", "Project X")
	p.ID = testProjectID
	p.Members = []entity.Member{
		adminMember,
		{UserID: usersToRemove[0].ID},
		{UserID: usersToRemove[1].ID},
	}
	p.Repository = entity.Repository{
		RepoName: "projectRepo-A",
	}

	expectedProject := entity.NewProject(testProjectID, p.Name, p.Description)
	expectedProject.Repository = p.Repository
	expectedProject.Members = []entity.Member{adminMember}
	expectedRemoveMemberActVars := [][]entity.UserActivityVar{
		{
			{
				Key:   "PROJECT_ID",
				Value: p.ID,
			},
			{
				Key:   "USER_ID",
				Value: usersToRemove[0].ID,
			},
		},
		{
			{
				Key:   "PROJECT_ID",
				Value: p.ID,
			},
			{
				Key:   "USER_ID",
				Value: usersToRemove[1].ID,
			},
		},
	}

	s.mocks.repo.EXPECT().Get(ctx, p.ID).Return(p, nil)

	s.mocks.repo.EXPECT().RemoveMembers(ctx, p.ID, usersToRemove).Return(nil)
	s.mocks.clock.EXPECT().Now().Return(now)
	s.mocks.userActivityRepo.EXPECT().Create(
		ctx,
		entity.UserActivity{
			Date:   now,
			UserID: loggedUser.ID,
			Type:   entity.UserActivityTypeRemoveMember,
			Vars:   expectedRemoveMemberActVars[0],
		},
	).Return(nil)
	s.mocks.userActivityRepo.EXPECT().Create(
		ctx,
		entity.UserActivity{
			Date:   now,
			UserID: loggedUser.ID,
			Type:   entity.UserActivityTypeRemoveMember,
			Vars:   expectedRemoveMemberActVars[1],
		},
	).Return(nil)
	s.mocks.repo.EXPECT().Get(ctx, p.ID).Return(expectedProject, nil)
	s.mocks.minioAdminService.EXPECT().LeaveProject(ctx, "user-a", testProjectID).Return(nil)
	s.mocks.minioAdminService.EXPECT().LeaveProject(ctx, "user-b", testProjectID).Return(nil)

	p, err := s.interactor.RemoveMembers(ctx, project.RemoveMembersOption{
		ProjectID:  p.ID,
		Users:      usersToRemove,
		LoggedUser: loggedUser,
	})

	require.NoError(t, err)
	assert.DeepEqual(t, expectedProject, p)
}

func TestInteractor_RemoveMembers_ErrNoMoreAdmins(t *testing.T) {
	s := newProjectSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()

	loggedUser := entity.User{
		ID:       "logged.user.1234",
		Username: "logged_user",
	}

	adminMember := entity.Member{
		UserID: loggedUser.ID, AccessLevel: entity.AccessLevelAdmin, AddedDate: time.Now().UTC(),
	}

	p := entity.NewProject(testProjectID, "project-x", "Project X")
	p.ID = testProjectID
	p.Members = []entity.Member{adminMember}

	s.mocks.repo.EXPECT().Get(ctx, p.ID).Return(p, nil)

	p, err := s.interactor.RemoveMembers(ctx, project.RemoveMembersOption{
		ProjectID:  p.ID,
		Users:      []entity.User{loggedUser},
		LoggedUser: loggedUser,
	})

	require.Equal(t, project.ErrRemoveNoMoreAdmins, err)
	require.Equal(t, entity.Project{}, p)
}

func TestInteractor_UpdateMembers(t *testing.T) {
	s := newProjectSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()
	now := time.Now().UTC()

	const newAccessLevel = entity.AccessLevelManager

	loggedUser := entity.User{
		ID:       "logged.user.1234",
		Username: "logged_user",
	}

	adminMember := entity.Member{
		UserID: loggedUser.ID, AccessLevel: entity.AccessLevelAdmin, AddedDate: time.Now().UTC(),
	}

	usersToUpd := []entity.User{
		{ID: "userA", Username: "user_a", AccessLevel: entity.AccessLevelViewer},
		{ID: "userB", Username: "user_b", AccessLevel: entity.AccessLevelViewer},
	}

	p := entity.NewProject(testProjectID, "project-x", "Project X")
	p.ID = testProjectID
	p.Members = []entity.Member{
		adminMember,
		{UserID: usersToUpd[0].ID},
		{UserID: usersToUpd[1].ID},
	}
	p.Repository = entity.Repository{
		RepoName: "projectRepo-A",
	}

	expectedProject := entity.NewProject(testProjectID, p.Name, p.Description)
	expectedProject.Repository = p.Repository
	expectedProject.Members = []entity.Member{adminMember}
	expectedUpdateMemberActVars := [][]entity.UserActivityVar{
		{
			{
				Key: "PROJECT_ID", Value: p.ID,
			},
			{
				Key: "USER_ID", Value: usersToUpd[0].ID,
			},
			{
				Key: "OLD_ACCESS_LEVEL", Value: string(entity.AccessLevelViewer),
			},
			{
				Key: "NEW_ACCESS_LEVEL", Value: string(newAccessLevel),
			},
		},
		{
			{
				Key: "PROJECT_ID", Value: p.ID,
			},
			{
				Key: "USER_ID", Value: usersToUpd[1].ID,
			},
			{
				Key: "OLD_ACCESS_LEVEL", Value: string(entity.AccessLevelViewer),
			},
			{
				Key: "NEW_ACCESS_LEVEL", Value: string(newAccessLevel),
			},
		},
	}

	s.mocks.repo.EXPECT().Get(ctx, p.ID).Return(p, nil)

	s.mocks.repo.EXPECT().UpdateMembersAccessLevel(ctx, p.ID, usersToUpd, newAccessLevel).Return(nil)
	s.mocks.clock.EXPECT().Now().Return(now)
	s.mocks.userActivityRepo.EXPECT().Create(
		ctx,
		entity.UserActivity{
			Date:   now,
			UserID: loggedUser.ID,
			Type:   entity.UserActivityTypeUpdateUserProjectAccessLevel,
			Vars:   expectedUpdateMemberActVars[0],
		},
	).Return(nil)
	s.mocks.userActivityRepo.EXPECT().Create(
		ctx,
		entity.UserActivity{
			Date:   now,
			UserID: loggedUser.ID,
			Type:   entity.UserActivityTypeUpdateUserProjectAccessLevel,
			Vars:   expectedUpdateMemberActVars[1],
		},
	).Return(nil)
	s.mocks.repo.EXPECT().Get(ctx, p.ID).Return(expectedProject, nil)

	p, err := s.interactor.UpdateMembers(ctx, project.UpdateMembersOption{
		ProjectID:   p.ID,
		Users:       usersToUpd,
		AccessLevel: newAccessLevel,
		LoggedUser:  loggedUser,
	})

	require.NoError(t, err)
	assert.DeepEqual(t, expectedProject, p)
}

func TestInteractor_UpdateMembers_ErrNoMoreAdmins(t *testing.T) {
	s := newProjectSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()

	const newAccessLevel = entity.AccessLevelViewer

	loggedUser := entity.User{
		ID:       "logged.user.1234",
		Username: "logged_user",
	}

	adminMember := entity.Member{
		UserID: loggedUser.ID, AccessLevel: entity.AccessLevelAdmin, AddedDate: time.Now().UTC(),
	}

	p := entity.NewProject(testProjectID, "project-x", "Project X")
	p.ID = testProjectID
	p.Members = []entity.Member{adminMember}

	s.mocks.repo.EXPECT().Get(ctx, p.ID).Return(p, nil)

	p, err := s.interactor.UpdateMembers(ctx, project.UpdateMembersOption{
		ProjectID:   p.ID,
		Users:       []entity.User{loggedUser},
		AccessLevel: newAccessLevel,
		LoggedUser:  loggedUser,
	})

	require.Equal(t, project.ErrUpdateNoMoreAdmins, err)
	assert.DeepEqual(t, entity.Project{}, p)
}

func TestInteractor_Update(t *testing.T) {
	s := newProjectSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()
	now := time.Now().UTC()

	oldName := "The old project name"
	newName := "The new project name"
	oldDesc := "The old description"
	newDesc := "The new description"
	oldArchived := false
	newArchived := true

	loggedUser := entity.User{
		ID: "logged-user",
	}

	originalProject := entity.Project{
		ID:           testProjectID,
		Name:         oldName,
		Description:  oldDesc,
		Archived:     oldArchived,
		CreationDate: now,
	}

	expectedProject := originalProject
	expectedProject.Name = newName
	expectedProject.Description = newDesc
	expectedProject.Archived = newArchived

	expectedUpdateNameActVars := []entity.UserActivityVar{
		{Key: "PROJECT_ID", Value: expectedProject.ID},
		{Key: "OLD_VALUE", Value: oldName},
		{Key: "NEW_VALUE", Value: newName},
	}
	expectedUpdateDescriptionActVars := []entity.UserActivityVar{
		{Key: "PROJECT_ID", Value: expectedProject.ID},
		{Key: "OLD_VALUE", Value: oldDesc},
		{Key: "NEW_VALUE", Value: newDesc},
	}
	expectedUpdateArchivedActVars := []entity.UserActivityVar{
		{Key: "PROJECT_ID", Value: expectedProject.ID},
		{Key: "OLD_VALUE", Value: strconv.FormatBool(oldArchived)},
		{Key: "NEW_VALUE", Value: strconv.FormatBool(newArchived)},
	}

	s.mocks.repo.EXPECT().Get(ctx, testProjectID).Return(originalProject, nil)
	s.mocks.clock.EXPECT().Now().Return(now)

	s.mocks.repo.EXPECT().UpdateName(ctx, testProjectID, newName).Return(nil)
	s.mocks.userActivityRepo.EXPECT().Create(
		ctx,
		entity.UserActivity{
			Date:   now,
			UserID: loggedUser.ID,
			Type:   entity.UserActivityTypeUpdateProjectName,
			Vars:   expectedUpdateNameActVars,
		},
	).Return(nil)

	s.mocks.repo.EXPECT().UpdateDescription(ctx, testProjectID, newDesc).Return(nil)
	s.mocks.userActivityRepo.EXPECT().Create(
		ctx,
		entity.UserActivity{
			Date:   now,
			UserID: loggedUser.ID,
			Type:   entity.UserActivityTypeUpdateProjectDescription,
			Vars:   expectedUpdateDescriptionActVars,
		},
	).Return(nil)

	s.mocks.repo.EXPECT().UpdateArchived(ctx, testProjectID, newArchived).Return(nil)
	s.mocks.userActivityRepo.EXPECT().Create(
		ctx,
		entity.UserActivity{
			Date:   now,
			UserID: loggedUser.ID,
			Type:   entity.UserActivityTypeUpdateProjectArchived,
			Vars:   expectedUpdateArchivedActVars,
		},
	).Return(nil)

	s.mocks.repo.EXPECT().Get(ctx, testProjectID).Return(expectedProject, nil)

	result, err := s.interactor.Update(ctx, project.UpdateProjectOption{
		ProjectID:   testProjectID,
		Name:        &newName,
		Description: &newDesc,
		Archived:    &newArchived,
		UserID:      loggedUser.ID,
	})

	require.NoError(t, err)
	require.Equal(t, expectedProject, result)
}

func TestInteractor_Delete(t *testing.T) {
	s := newProjectSuite(t)
	defer s.ctrl.Finish()

	const (
		accessKey = "project-test-project"
	)

	monkey.Patch(time.Now, func() time.Time {
		return time.Date(2021, 1, 1, 0, 0, 0, 0, time.UTC)
	})
	defer monkey.UnpatchAll()

	ctx := context.Background()
	now := time.Now().UTC()

	loggedUser := entity.User{
		ID:          "logged-user",
		AccessLevel: entity.AccessLevelAdmin,
	}

	expectedProject := entity.Project{
		ID:           testProjectID,
		Name:         "The Project Y",
		Description:  "The Project Y Description",
		CreationDate: now,
		Repository: entity.Repository{
			URL:      "https://github.com/org/repo.git",
			RepoName: testProjectID,
		},
		Members: []entity.Member{
			{
				UserID:      loggedUser.ID,
				AccessLevel: entity.AccessLevelAdmin,
			},
		},
	}

	expectedMinioBackup := "minio-backup"

	userActivity := entity.UserActivity{
		Date:   now,
		UserID: loggedUser.ID,
		Type:   entity.UserActivityTypeDeleteProject,
		Vars: []entity.UserActivityVar{
			{
				Key:   "PROJECT_ID",
				Value: testProjectID,
			},
			{
				Key:   "MINIO_BACKUP_BUCKET",
				Value: expectedMinioBackup,
			},
		},
	}

	s.mocks.repo.EXPECT().Get(ctx, testProjectID).Return(expectedProject, nil)
	s.mocks.k8sClient.EXPECT().DeleteKDLProjectCR(ctx, testProjectID).Return(nil)
	s.mocks.repo.EXPECT().DeleteOne(ctx, testProjectID).Return(nil)
	s.mocks.minioService.EXPECT().DeleteBucket(ctx, testProjectID).Return(expectedMinioBackup, nil)
	s.mocks.minioAdminService.EXPECT().DeleteProjectPolicy(ctx, accessKey).Return(nil)
	s.mocks.minioAdminService.EXPECT().DeleteUser(ctx, accessKey).Return(nil)
	s.mocks.clock.EXPECT().Now().Return(now)
	s.mocks.userActivityRepo.EXPECT().Create(ctx, userActivity).Return(nil)

	result, err := s.interactor.Delete(ctx, project.DeleteProjectOption{
		LoggedUser: loggedUser,
		ProjectID:  testProjectID,
	})
	require.NoError(t, err)

	require.Equal(t, expectedProject, *result)
}

func TestInteractor_Delete_NotAdminUser(t *testing.T) {
	s := newProjectSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()
	now := time.Now().UTC()

	loggedUser := entity.User{
		ID:          "logged-user",
		AccessLevel: entity.AccessLevelAdmin,
	}

	expectedProject := entity.Project{
		ID:           testProjectID,
		Name:         "The Project Y",
		Description:  "The Project Y Description",
		CreationDate: now,
		Repository: entity.Repository{
			URL:      "https://github.com/org/repo.git",
			RepoName: testProjectID,
		},
	}

	s.mocks.repo.EXPECT().Get(ctx, testProjectID).Return(expectedProject, nil)

	_, err := s.interactor.Delete(ctx, project.DeleteProjectOption{
		LoggedUser: loggedUser,
		ProjectID:  testProjectID,
	})
	require.Error(t, err)
}

func TestInteractor_Delete_ProjectNoExists(t *testing.T) {
	s := newProjectSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()

	loggedUser := entity.User{
		ID:          "logged-user",
		AccessLevel: entity.AccessLevelAdmin,
	}

	s.mocks.repo.EXPECT().Get(ctx, testProjectID).Return(entity.Project{}, project.ErrRepoNotFound)

	_, err := s.interactor.Delete(ctx, project.DeleteProjectOption{
		LoggedUser: loggedUser,
		ProjectID:  testProjectID,
	})
	require.Error(t, err)
}

func TestInteractor_UpdateKDLProjects(t *testing.T) {
	s := newProjectSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()

	configMap := v1.ConfigMap{
		Data: map[string]string{},
	}
	configMap.Data["template"] = ""

	crd := map[string]interface{}{}
	listCrd := []string{"kdlprojects-v1", "kdlprojects-v2"}

	s.mocks.k8sClient.EXPECT().GetConfigMapTemplateNameKDLProject().Return(templateConfigMap)
	s.mocks.k8sClient.EXPECT().GetConfigMap(ctx, templateConfigMap).Return(&configMap, nil)
	s.mocks.k8sClient.EXPECT().ListKDLProjectsNameCR(ctx).Return(listCrd, nil)
	s.mocks.k8sClient.EXPECT().UpdateKDLProjectsCR(ctx, listCrd[0], &crd).Return(nil)
	s.mocks.k8sClient.EXPECT().UpdateKDLProjectsCR(ctx, listCrd[1], &crd).Return(nil)

	err := s.interactor.UpdateKDLProjects(ctx)
	require.NoError(t, err)
}

func TestInteractor_UpdateKDLProjects_UpdateKDLProjectsCR_Error(t *testing.T) {
	s := newProjectSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()

	configMap := v1.ConfigMap{
		Data: map[string]string{},
	}
	configMap.Data["template"] = ""

	crd := map[string]interface{}{}
	listCrd := []string{"kdlprojects-v1"}

	s.mocks.k8sClient.EXPECT().GetConfigMapTemplateNameKDLProject().Return(templateConfigMap)
	s.mocks.k8sClient.EXPECT().GetConfigMap(ctx, templateConfigMap).Return(&configMap, nil)
	s.mocks.k8sClient.EXPECT().ListKDLProjectsNameCR(ctx).Return(listCrd, nil)
	s.mocks.k8sClient.EXPECT().UpdateKDLProjectsCR(ctx, listCrd[0], &crd).Return(errUpdatingCrd)

	// even if there is an error updating the CRD,
	// the function should return no error to allow updating the next CRD
	err := s.interactor.UpdateKDLProjects(ctx)
	require.NoError(t, err)
}

func TestInteractor_UpdateKDLProjects_NoConfigmap(t *testing.T) {
	s := newProjectSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()

	s.mocks.k8sClient.EXPECT().GetConfigMapTemplateNameKDLProject().Return(templateConfigMap)
	s.mocks.k8sClient.EXPECT().GetConfigMap(ctx, templateConfigMap).Return(nil, errNoConfigMap)

	err := s.interactor.UpdateKDLProjects(ctx)
	require.Error(t, err)
}

func TestInteractor_UpdateKDLProjects_CDRTemplate_ErrorNoTemplate(t *testing.T) {
	s := newProjectSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()
	configMap := v1.ConfigMap{}

	s.mocks.k8sClient.EXPECT().GetConfigMapTemplateNameKDLProject().Return(templateConfigMap)
	s.mocks.k8sClient.EXPECT().GetConfigMap(ctx, templateConfigMap).Return(&configMap, nil)

	err := s.interactor.UpdateKDLProjects(ctx)
	require.Error(t, err)
}

func TestInteractor_UpdateKDLProjects_ListKDLProjectsNameCR_Error(t *testing.T) {
	s := newProjectSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()

	configMap := v1.ConfigMap{
		Data: map[string]string{},
	}
	configMap.Data["template"] = ""

	s.mocks.k8sClient.EXPECT().GetConfigMapTemplateNameKDLProject().Return(templateConfigMap)
	s.mocks.k8sClient.EXPECT().GetConfigMap(ctx, templateConfigMap).Return(&configMap, nil)
	s.mocks.k8sClient.EXPECT().ListKDLProjectsNameCR(ctx).Return(nil, errListProjects)

	err := s.interactor.UpdateKDLProjects(ctx)
	require.Error(t, err)
}

func TestInteractor_UpdateKDLProjects_ListKDLProjectsNameCR_EmptyList(t *testing.T) {
	s := newProjectSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()

	configMap := v1.ConfigMap{
		Data: map[string]string{},
	}
	configMap.Data["template"] = ""

	s.mocks.k8sClient.EXPECT().GetConfigMapTemplateNameKDLProject().Return(templateConfigMap)
	s.mocks.k8sClient.EXPECT().GetConfigMap(ctx, templateConfigMap).Return(&configMap, nil)
	s.mocks.k8sClient.EXPECT().ListKDLProjectsNameCR(ctx).Return([]string{}, nil)

	err := s.interactor.UpdateKDLProjects(ctx)
	require.NoError(t, err)
}
