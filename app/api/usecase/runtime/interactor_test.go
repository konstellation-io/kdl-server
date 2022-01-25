package runtime_test

import (
	"context"
	"github.com/golang/mock/gomock"
	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/k8s"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
	"github.com/konstellation-io/kdl-server/app/api/usecase/project"
	"github.com/konstellation-io/kdl-server/app/api/usecase/runtime"
	"github.com/stretchr/testify/require"
	"testing"
)

const someProjectID = "project-1234"

type Runtimesuite struct {
	ctrl       *gomock.Controller
	interactor runtime.UseCase
	mocks      flavorMocks
}
type flavorMocks struct {
	logger      *logging.MockLogger
	repo        *runtime.MockRepository
	projectRepo *project.MockRepository
	k8client    *k8s.MockK8sClient
}

func newRuntimesuite(t *testing.T) *Runtimesuite {
	ctrl := gomock.NewController(t)
	logger := logging.NewMockLogger(ctrl)
	logging.AddLoggerExpects(logger)
	repo := runtime.NewMockRepository(ctrl)
	k8client := k8s.NewMockK8sClient(ctrl)
	projectRepo := project.NewMockRepository(ctrl)
	interactor := runtime.NewInteractor(logger, k8client, repo, projectRepo)
	return &Runtimesuite{
		ctrl:       ctrl,
		interactor: interactor,
		mocks: flavorMocks{
			logger:      logger,
			repo:        repo,
			projectRepo: projectRepo,
			k8client:    k8client,
		},
	}
}

func TestInteractor_GetRunningRuntime(t *testing.T) {
	s := newRuntimesuite(t)
	defer s.ctrl.Finish()

	const (
		username    = "john.doe"
		runtimeId   = "1234"
		runtimeName = "Runtime 1"
		dockerImage = "konstellation/image"
	)

	ctx := context.Background()

	expectedRuntime := entity.NewRuntime(runtimeId, runtimeName, dockerImage)

	s.mocks.k8client.EXPECT().GetRunningRuntimePODRuntimeId(ctx, username).Return(runtimeId, nil)
	s.mocks.repo.EXPECT().Get(ctx, runtimeId).Return(expectedRuntime, nil)

	f, err := s.interactor.GetRunningRuntime(ctx, username)

	require.NoError(t, err)
	require.Equal(t, f, &expectedRuntime)
}

func TestInteractor_GetProjectRuntimes(t *testing.T) {
	s := newRuntimesuite(t)
	defer s.ctrl.Finish()

	const (
		runtimeId    = "1234"
		genRuntimeId = "5678"
		runtimeName  = "Runtime 1"
		dockerImage  = "konstellation/image"
	)

	ctx := context.Background()
	expectedProjectRuntimes := []entity.Runtime{
		entity.NewRuntime(runtimeId, runtimeName, dockerImage),
	}

	expectedGenericRuntimes := []entity.Runtime{
		entity.NewRuntime(genRuntimeId, runtimeName, dockerImage),
	}

	expectedProject := entity.NewProject(someProjectID, "project-x", "Project X")
	expectedProject.Runtimes = expectedProjectRuntimes

	s.mocks.projectRepo.EXPECT().Get(ctx, someProjectID).Return(expectedProject, nil)
	s.mocks.repo.EXPECT().FindAll(ctx).Return(expectedGenericRuntimes, nil)

	f, err := s.interactor.GetProjectRuntimes(ctx, someProjectID)

	require.NoError(t, err)
	require.Equal(t, f, append(expectedGenericRuntimes, expectedProjectRuntimes...))
}
