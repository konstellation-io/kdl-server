package project_test

import (
	"context"
	"testing"
	"time"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/droneservice"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/giteaservice"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/minioservice"
	"github.com/konstellation-io/kdl-server/app/api/pkg/clock"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
	"github.com/konstellation-io/kdl-server/app/api/usecase/project"
)

const (
	someProjectID = "project.1234"
)

type projectSuite struct {
	ctrl       *gomock.Controller
	interactor project.UseCase
	mocks      projectMocks
}

type projectMocks struct {
	logger       *logging.MockLogger
	repo         *project.MockRepository
	clock        *clock.MockClock
	giteaService *giteaservice.MockGiteaClient
	minioService *minioservice.MockMinioService
	droneService *droneservice.MockDroneService
}

func newProjectSuite(t *testing.T) *projectSuite {
	ctrl := gomock.NewController(t)

	logger := logging.NewMockLogger(ctrl)
	logging.AddLoggerExpects(logger)

	repo := project.NewMockRepository(ctrl)

	clockMock := clock.NewMockClock(ctrl)

	giteaService := giteaservice.NewMockGiteaClient(ctrl)

	minioService := minioservice.NewMockMinioService(ctrl)

	droneService := droneservice.NewMockDroneService(ctrl)

	interactor := project.NewInteractor(logger, repo, clockMock, giteaService, minioService, droneService)

	return &projectSuite{
		ctrl:       ctrl,
		interactor: interactor,
		mocks: projectMocks{
			logger:       logger,
			repo:         repo,
			clock:        clockMock,
			giteaService: giteaService,
			minioService: minioService,
			droneService: droneService,
		},
	}
}

func TestInteractor_CreateInternal(t *testing.T) {
	s := newProjectSuite(t)
	defer s.ctrl.Finish()

	const (
		projectID     = someProjectID
		projectName   = "The Project X"
		projectDesc   = "The Project X Description"
		ownerUserID   = "user.1234"
		ownerUsername = "john"
	)

	var internalRepoName = "project-x"

	ctx := context.Background()
	now := time.Now().UTC()

	createProject := entity.NewProject(projectName, projectDesc)
	createProject.CreationDate = now
	createProject.Members = []entity.Member{
		{
			UserID:      ownerUserID,
			AccessLevel: entity.AccessLevelAdmin,
			AddedDate:   now,
		},
	}
	createProject.Repository = entity.Repository{
		Type:             entity.RepositoryTypeInternal,
		InternalRepoName: internalRepoName,
		RepoName:         internalRepoName,
	}

	expectedProject := entity.Project{
		ID:           projectID,
		Name:         projectName,
		Description:  projectDesc,
		CreationDate: now,
		Repository: entity.Repository{
			Type:             entity.RepositoryTypeInternal,
			InternalRepoName: internalRepoName,
		},
	}

	s.mocks.giteaService.EXPECT().CreateRepo(internalRepoName, ownerUsername).Return(nil)
	s.mocks.minioService.EXPECT().CreateBucket(internalRepoName).Return(nil)
	s.mocks.droneService.EXPECT().ActivateRepository(internalRepoName).Return(nil)
	s.mocks.clock.EXPECT().Now().Return(now)
	s.mocks.repo.EXPECT().Create(ctx, createProject).Return(projectID, nil)
	s.mocks.repo.EXPECT().Get(ctx, projectID).Return(expectedProject, nil)

	createdProject, err := s.interactor.Create(ctx, project.CreateProjectOption{
		Name:                 projectName,
		Description:          projectDesc,
		RepoType:             entity.RepositoryTypeInternal,
		InternalRepoName:     &internalRepoName,
		ExternalRepoURL:      nil,
		ExternalRepoUsername: nil,
		ExternalRepoToken:    nil,
		Owner:                entity.User{ID: ownerUserID, Username: ownerUsername},
	})

	require.NoError(t, err)
	require.Equal(t, expectedProject, createdProject)
}

func TestInteractor_CreateExternal(t *testing.T) {
	s := newProjectSuite(t)
	defer s.ctrl.Finish()

	const (
		projectID     = "project.2345"
		projectName   = "The Project Y"
		projectDesc   = "The Project Y Description"
		repoName      = "repo"
		ownerUserID   = "user.1234"
		ownerUsername = "john"
	)

	externalRepoURL := "https://github.com/org/repo.git"
	externalRepoUsername := "username"
	externalRepoToken := "token"

	ctx := context.Background()
	now := time.Now().UTC()

	createProject := entity.NewProject(projectName, projectDesc)
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
		RepoName:        repoName,
	}

	expectedProject := entity.Project{
		ID:           projectID,
		Name:         projectName,
		Description:  projectDesc,
		CreationDate: now,
		Repository: entity.Repository{
			Type:            entity.RepositoryTypeExternal,
			ExternalRepoURL: externalRepoURL,
			RepoName:        repoName,
		},
	}

	s.mocks.giteaService.EXPECT().MirrorRepo(externalRepoURL, repoName, externalRepoUsername, externalRepoToken).Return(nil)
	s.mocks.minioService.EXPECT().CreateBucket(repoName).Return(nil)
	s.mocks.droneService.EXPECT().ActivateRepository(repoName).Return(nil)
	s.mocks.clock.EXPECT().Now().Return(now)
	s.mocks.repo.EXPECT().Create(ctx, createProject).Return(projectID, nil)
	s.mocks.repo.EXPECT().Get(ctx, projectID).Return(expectedProject, nil)

	createdProject, err := s.interactor.Create(ctx, project.CreateProjectOption{
		Name:                 projectName,
		Description:          projectDesc,
		RepoType:             entity.RepositoryTypeExternal,
		InternalRepoName:     nil,
		ExternalRepoURL:      &externalRepoURL,
		ExternalRepoUsername: &externalRepoUsername,
		ExternalRepoToken:    &externalRepoToken,
		Owner:                entity.User{ID: ownerUserID, Username: ownerUsername},
	})

	require.NoError(t, err)
	require.Equal(t, expectedProject, createdProject)
}

func TestInteractor_FindByUserID(t *testing.T) {
	s := newProjectSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()
	expectedProjects := []entity.Project{
		entity.NewProject("project-x", "Project X"),
	}

	s.mocks.repo.EXPECT().GetAll(ctx).Return(expectedProjects, nil)

	p, err := s.interactor.GetAll(ctx)

	require.NoError(t, err)
	require.Equal(t, p, expectedProjects)
}

func TestInteractor_GetByID(t *testing.T) {
	s := newProjectSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()
	expectedProject := entity.NewProject("project-x", "Project X")

	s.mocks.repo.EXPECT().Get(ctx, someProjectID).Return(expectedProject, nil)

	p, err := s.interactor.GetByID(ctx, someProjectID)

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

	p := entity.NewProject("project-x", "Project X")
	p.ID = someProjectID
	p.Members = []entity.Member{adminMember}
	p.Repository = entity.Repository{
		Type:             entity.RepositoryTypeInternal,
		InternalRepoName: "repo-A",
	}

	usersToAdd := []entity.User{
		{ID: "userA", Username: "user_a"},
		{ID: "userB", Username: "user_b"},
	}

	newMembers := []entity.Member{
		{UserID: usersToAdd[0].ID, AccessLevel: project.MemberAccessLevelOnCreation, AddedDate: now},
		{UserID: usersToAdd[1].ID, AccessLevel: project.MemberAccessLevelOnCreation, AddedDate: now},
	}

	expectedProject := entity.NewProject(p.Name, p.Description)
	expectedProject.Repository = p.Repository
	expectedProject.Members = []entity.Member{adminMember, newMembers[0], newMembers[1]}

	s.mocks.repo.EXPECT().Get(ctx, p.ID).Return(p, nil)
	gomock.InOrder(
		s.mocks.giteaService.EXPECT().
			AddCollaborator(p.Repository.InternalRepoName, usersToAdd[0].Username, project.MemberAccessLevelOnCreation).
			Return(nil),
		s.mocks.giteaService.EXPECT().
			AddCollaborator(p.Repository.InternalRepoName, usersToAdd[1].Username, project.MemberAccessLevelOnCreation).
			Return(nil),
	)
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

func TestInteractor_RemoveMember(t *testing.T) {
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

	userToRemove := entity.User{ID: "userA", Username: "user_a"}

	p := entity.NewProject("project-x", "Project X")
	p.ID = someProjectID
	p.Members = []entity.Member{adminMember, {UserID: userToRemove.ID}}
	p.Repository = entity.Repository{
		Type:             entity.RepositoryTypeInternal,
		InternalRepoName: "repo-A",
	}

	expectedProject := entity.NewProject(p.Name, p.Description)
	expectedProject.Repository = p.Repository
	expectedProject.Members = []entity.Member{adminMember}

	s.mocks.repo.EXPECT().Get(ctx, p.ID).Return(p, nil)
	s.mocks.giteaService.EXPECT().
		RemoveCollaborator(p.Repository.InternalRepoName, userToRemove.Username).
		Return(nil)

	s.mocks.repo.EXPECT().RemoveMember(ctx, p.ID, userToRemove.ID).Return(nil)
	s.mocks.repo.EXPECT().Get(ctx, p.ID).Return(expectedProject, nil)

	p, err := s.interactor.RemoveMember(ctx, project.RemoveMemberOption{
		ProjectID:  p.ID,
		User:       userToRemove,
		LoggedUser: loggedUser,
	})

	require.NoError(t, err)
	require.Equal(t, p, expectedProject)
}

func TestInteractor_RemoveMember_ErrNoMoreAdmins(t *testing.T) {
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

	p := entity.NewProject("project-x", "Project X")
	p.ID = someProjectID
	p.Members = []entity.Member{adminMember}

	s.mocks.repo.EXPECT().Get(ctx, p.ID).Return(p, nil)

	p, err := s.interactor.RemoveMember(ctx, project.RemoveMemberOption{
		ProjectID:  p.ID,
		User:       loggedUser,
		LoggedUser: loggedUser,
	})

	require.Equal(t, project.ErrRemoveNoMoreAdmins, err)
	require.Equal(t, entity.Project{}, p)
}

func TestInteractor_UpdateMember(t *testing.T) {
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

	userToUpd := entity.User{ID: "userA", Username: "user_a"}

	p := entity.NewProject("project-x", "Project X")
	p.ID = someProjectID
	p.Members = []entity.Member{adminMember, {UserID: userToUpd.ID}}
	p.Repository = entity.Repository{
		Type:             entity.RepositoryTypeInternal,
		InternalRepoName: "repo-A",
	}

	expectedProject := entity.NewProject(p.Name, p.Description)
	expectedProject.Repository = p.Repository
	expectedProject.Members = []entity.Member{adminMember}

	s.mocks.repo.EXPECT().Get(ctx, p.ID).Return(p, nil)
	s.mocks.giteaService.EXPECT().
		UpdateCollaboratorPermissions(p.Repository.InternalRepoName, userToUpd.Username, newAccessLevel).
		Return(nil)

	s.mocks.repo.EXPECT().UpdateMemberAccessLevel(ctx, p.ID, userToUpd.ID, newAccessLevel).Return(nil)
	s.mocks.repo.EXPECT().Get(ctx, p.ID).Return(expectedProject, nil)

	p, err := s.interactor.UpdateMember(ctx, project.UpdateMemberOption{
		ProjectID:   p.ID,
		User:        userToUpd,
		AccessLevel: newAccessLevel,
		LoggedUser:  loggedUser,
	})

	require.NoError(t, err)
	require.Equal(t, p, expectedProject)
}

func TestInteractor_UpdateMember_ErrNoMoreAdmins(t *testing.T) {
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

	p := entity.NewProject("project-x", "Project X")
	p.ID = someProjectID
	p.Members = []entity.Member{adminMember}

	s.mocks.repo.EXPECT().Get(ctx, p.ID).Return(p, nil)

	p, err := s.interactor.UpdateMember(ctx, project.UpdateMemberOption{
		ProjectID:   p.ID,
		User:        loggedUser,
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
		ID:          someProjectID,
		Name:        newName,
		Description: newDesc,
	}

	ctx := context.Background()

	s.mocks.repo.EXPECT().UpdateName(ctx, someProjectID, newName).Return(nil)
	s.mocks.repo.EXPECT().UpdateDescription(ctx, someProjectID, newDesc).Return(nil)
	s.mocks.repo.EXPECT().Get(ctx, someProjectID).Return(expectedProject, nil)

	result, err := s.interactor.Update(ctx, project.UpdateProjectOption{
		ProjectID:   someProjectID,
		Name:        &newName,
		Description: &newDesc,
	})

	require.NoError(t, err)
	require.Equal(t, expectedProject, result)
}
