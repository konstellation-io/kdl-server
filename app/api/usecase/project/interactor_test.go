package project_test

import (
	"context"
	"testing"
	"time"

	"bou.ke/monkey"
	"github.com/go-logr/logr"
	"github.com/go-logr/zapr"
	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/k8s"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/minioservice"
	"github.com/konstellation-io/kdl-server/app/api/pkg/clock"
	"github.com/konstellation-io/kdl-server/app/api/usecase/project"
)

const (
	testProjectID = "test-project"
)

type projectSuite struct {
	ctrl       *gomock.Controller
	interactor project.UseCase
	mocks      projectMocks
}

type projectMocks struct {
	logger           logr.Logger
	repo             *project.MockRepository
	userActivityRepo *project.MockUserActivityRepo
	clock            *clock.MockClock
	minioService     *minioservice.MockMinioService
	k8sClient        *k8s.MockClient
}

func newProjectSuite(t *testing.T) *projectSuite {
	ctrl := gomock.NewController(t)
	repo := project.NewMockRepository(ctrl)
	userActivityRepo := project.NewMockUserActivityRepo(ctrl)
	clockMock := clock.NewMockClock(ctrl)
	minioService := minioservice.NewMockMinioService(ctrl)
	k8sClient := k8s.NewMockClient(ctrl)

	zapLog, err := zap.NewDevelopment()
	require.NoError(t, err)

	logger := zapr.NewLogger(zapLog)

	deps := &project.InteractorDeps{
		Logger:           logger,
		Repo:             repo,
		UserActivityRepo: userActivityRepo,
		Clock:            clockMock,
		MinioService:     minioService,
		K8sClient:        k8sClient,
	}
	interactor := project.NewInteractor(deps)

	return &projectSuite{
		ctrl:       ctrl,
		interactor: interactor,
		mocks: projectMocks{
			logger:           logger,
			repo:             repo,
			userActivityRepo: userActivityRepo,
			clock:            clockMock,
			minioService:     minioService,
			k8sClient:        k8sClient,
		},
	}
}

func TestInteractor_CreateExternal(t *testing.T) {
	s := newProjectSuite(t)
	defer s.ctrl.Finish()

	const (
		projectName   = "The Project Y"
		projectDesc   = "The Project Y Description"
		ownerUserID   = "user.1234"
		ownerUsername = "john"
	)

	externalRepoURL := "https://github.com/org/repo.git"
	externalRepoUsername := "username"
	externalRepoToken := "token"
	externalAuthMethod := entity.RepositoryAuthToken

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
		Type:            entity.RepositoryTypeExternal,
		ExternalRepoURL: externalRepoURL,
		RepoName:        testProjectID,
	}

	expectedProject := entity.Project{
		ID:           testProjectID,
		Name:         projectName,
		Description:  projectDesc,
		CreationDate: now,
		Repository: entity.Repository{
			Type:            entity.RepositoryTypeExternal,
			ExternalRepoURL: externalRepoURL,
			RepoName:        testProjectID,
		},
	}

	s.mocks.k8sClient.EXPECT().CreateKDLProjectCR(ctx, testProjectID).Return(nil)
	s.mocks.minioService.EXPECT().CreateBucket(ctx, testProjectID).Return(nil)
	s.mocks.minioService.EXPECT().CreateProjectDirs(ctx, testProjectID).Return(nil)
	s.mocks.clock.EXPECT().Now().Return(now)
	s.mocks.repo.EXPECT().Create(ctx, createProject).Return(testProjectID, nil)
	s.mocks.repo.EXPECT().Get(ctx, testProjectID).Return(expectedProject, nil)

	createdProject, err := s.interactor.Create(ctx, project.CreateProjectOption{
		ProjectID:              testProjectID,
		Name:                   projectName,
		Description:            projectDesc,
		RepoType:               entity.RepositoryTypeExternal,
		ExternalRepoURL:        &externalRepoURL,
		ExternalRepoUsername:   &externalRepoUsername,
		ExternalRepoCredential: externalRepoToken,
		ExternalRepoAuthMethod: externalAuthMethod,
		Owner:                  entity.User{ID: ownerUserID, Username: ownerUsername},
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
	require.Equal(t, p, expectedProjects)
}

func TestInteractor_GetByID(t *testing.T) {
	s := newProjectSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()
	expectedProject := entity.NewProject(testProjectID, "project-x", "Project X")

	s.mocks.repo.EXPECT().Get(ctx, testProjectID).Return(expectedProject, nil)

	p, err := s.interactor.GetByID(ctx, testProjectID)

	require.NoError(t, err)
	require.Equal(t, p, expectedProject)
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
		Type:     entity.RepositoryTypeInternal,
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

	s.mocks.repo.EXPECT().Get(ctx, p.ID).Return(p, nil)
	s.mocks.clock.EXPECT().Now().Return(now)
	s.mocks.repo.EXPECT().AddMembers(ctx, p.ID, newMembers).Return(nil)
	s.mocks.repo.EXPECT().Get(ctx, p.ID).Return(expectedProject, nil)

	p, err := s.interactor.AddMembers(ctx, project.AddMembersOption{
		ProjectID:  p.ID,
		Users:      usersToAdd,
		LoggedUser: loggedUser,
	})

	require.NoError(t, err)
	require.Equal(t, p, expectedProject)
}

func TestInteractor_RemoveMembers(t *testing.T) {
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
		Type:     entity.RepositoryTypeInternal,
		RepoName: "projectRepo-A",
	}

	expectedProject := entity.NewProject(testProjectID, p.Name, p.Description)
	expectedProject.Repository = p.Repository
	expectedProject.Members = []entity.Member{adminMember}

	s.mocks.repo.EXPECT().Get(ctx, p.ID).Return(p, nil)

	s.mocks.repo.EXPECT().RemoveMembers(ctx, p.ID, usersToRemove).Return(nil)
	s.mocks.repo.EXPECT().Get(ctx, p.ID).Return(expectedProject, nil)

	p, err := s.interactor.RemoveMembers(ctx, project.RemoveMembersOption{
		ProjectID:  p.ID,
		Users:      usersToRemove,
		LoggedUser: loggedUser,
	})

	require.NoError(t, err)
	require.Equal(t, p, expectedProject)
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

	const newAccessLevel = entity.AccessLevelManager

	loggedUser := entity.User{
		ID:       "logged.user.1234",
		Username: "logged_user",
	}

	adminMember := entity.Member{
		UserID: loggedUser.ID, AccessLevel: entity.AccessLevelAdmin, AddedDate: time.Now().UTC(),
	}

	usersToUpd := []entity.User{
		{ID: "userA", Username: "user_a"},
		{ID: "userB", Username: "user_b"},
	}

	p := entity.NewProject(testProjectID, "project-x", "Project X")
	p.ID = testProjectID
	p.Members = []entity.Member{
		adminMember,
		{UserID: usersToUpd[0].ID},
		{UserID: usersToUpd[1].ID},
	}
	p.Repository = entity.Repository{
		Type:     entity.RepositoryTypeInternal,
		RepoName: "projectRepo-A",
	}

	expectedProject := entity.NewProject(testProjectID, p.Name, p.Description)
	expectedProject.Repository = p.Repository
	expectedProject.Members = []entity.Member{adminMember}

	s.mocks.repo.EXPECT().Get(ctx, p.ID).Return(p, nil)

	s.mocks.repo.EXPECT().UpdateMembersAccessLevel(ctx, p.ID, usersToUpd, newAccessLevel).Return(nil)
	s.mocks.repo.EXPECT().Get(ctx, p.ID).Return(expectedProject, nil)

	p, err := s.interactor.UpdateMembers(ctx, project.UpdateMembersOption{
		ProjectID:   p.ID,
		Users:       usersToUpd,
		AccessLevel: newAccessLevel,
		LoggedUser:  loggedUser,
	})

	require.NoError(t, err)
	require.Equal(t, p, expectedProject)
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
	require.Equal(t, p, entity.Project{})
}

func TestInteractor_Update(t *testing.T) {
	s := newProjectSuite(t)
	defer s.ctrl.Finish()

	newName := "The new project name"
	newDesc := "the new description"

	expectedProject := entity.Project{
		ID:          testProjectID,
		Name:        newName,
		Description: newDesc,
	}

	ctx := context.Background()

	s.mocks.repo.EXPECT().UpdateName(ctx, testProjectID, newName).Return(nil)
	s.mocks.repo.EXPECT().UpdateDescription(ctx, testProjectID, newDesc).Return(nil)
	s.mocks.repo.EXPECT().Get(ctx, testProjectID).Return(expectedProject, nil)

	result, err := s.interactor.Update(ctx, project.UpdateProjectOption{
		ProjectID:   testProjectID,
		Name:        &newName,
		Description: &newDesc,
	})

	require.NoError(t, err)
	require.Equal(t, expectedProject, result)
}

func TestInteractor_Delete(t *testing.T) {
	s := newProjectSuite(t)
	defer s.ctrl.Finish()

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
			Type:            entity.RepositoryTypeExternal,
			ExternalRepoURL: "https://github.com/org/repo.git",
			RepoName:        testProjectID,
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
		Date:   time.Now(),
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
			Type:            entity.RepositoryTypeExternal,
			ExternalRepoURL: "https://github.com/org/repo.git",
			RepoName:        testProjectID,
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
