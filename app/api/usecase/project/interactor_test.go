package project_test

import (
	"context"
	"github.com/konstellation-io/kdl-server/app/api/pkg/giteaclient"
	"testing"
	"time"

	"github.com/konstellation-io/kdl-server/app/api/pkg/clock"

	"github.com/golang/mock/gomock"
	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
	"github.com/konstellation-io/kdl-server/app/api/usecase/project"
	"github.com/stretchr/testify/require"
)

type projectSuite struct {
	ctrl       *gomock.Controller
	interactor project.UseCase
	mocks      projectMocks
}

type projectMocks struct {
	logger      *logging.MockLogger
	repo        *project.MockRepository
	clock       *clock.MockClock
	giteaClient *giteaclient.MockGiteaClient
}

func newProjectSuite(t *testing.T) *projectSuite {
	ctrl := gomock.NewController(t)

	logger := logging.NewMockLogger(ctrl)
	logging.AddLoggerExpects(logger)

	repo := project.NewMockRepository(ctrl)

	clockMock := clock.NewMockClock(ctrl)

	giteaClient := giteaclient.NewMockGiteaClient(ctrl)

	interactor := project.NewInteractor(logger, repo, clockMock, giteaClient)

	return &projectSuite{
		ctrl:       ctrl,
		interactor: interactor,
		mocks: projectMocks{
			logger:      logger,
			repo:        repo,
			clock:       clockMock,
			giteaClient: giteaClient,
		},
	}
}

func TestInteractor_Create(t *testing.T) {
	s := newProjectSuite(t)
	defer s.ctrl.Finish()

	const (
		projectID   = "project.1234"
		projectName = "project-x"
		projectDesc = "description"
	)

	ctx := context.Background()
	now := time.Now().UTC()

	p := entity.NewProject(projectName, projectDesc)
	p.CreationDate = now

	expectedProject := entity.Project{
		ID:           projectID,
		Name:         projectName,
		Description:  projectDesc,
		CreationDate: now,
	}

	s.mocks.giteaClient.EXPECT().CreateRepo(projectName, projectDesc)
	s.mocks.clock.EXPECT().Now().Return(now)
	s.mocks.repo.EXPECT().Create(ctx, p).Return(projectID, nil)
	s.mocks.repo.EXPECT().Get(ctx, projectID).Return(expectedProject, nil)

	createdProject, err := s.interactor.Create(ctx, projectName, projectDesc)

	require.NoError(t, err)
	require.Equal(t, expectedProject, createdProject)
}
