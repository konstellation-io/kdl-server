package runtime_test

import (
	"context"
	"github.com/golang/mock/gomock"
	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/k8s"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
	"github.com/konstellation-io/kdl-server/app/api/usecase/runtime"
	"github.com/stretchr/testify/require"
	"testing"
)

type Runtimesuite struct {
	ctrl       *gomock.Controller
	interactor runtime.UseCase
	mocks      flavorMocks
}
type flavorMocks struct {
	logger   *logging.MockLogger
	repo     *runtime.MockRepository
	k8client *k8s.MockK8sClient
}

func newRuntimesuite(t *testing.T) *Runtimesuite {
	ctrl := gomock.NewController(t)
	logger := logging.NewMockLogger(ctrl)
	logging.AddLoggerExpects(logger)
	repo := runtime.NewMockRepository(ctrl)
	k8client := k8s.NewMockK8sClient(ctrl)
	interactor := runtime.NewInteractor(logger, k8client, repo)
	return &Runtimesuite{
		ctrl:       ctrl,
		interactor: interactor,
		mocks: flavorMocks{
			logger:   logger,
			repo:     repo,
			k8client: k8client,
		},
	}
}

func TestInteractor_GetRunningRuntime(t *testing.T) {
	s := newRuntimesuite(t)
	defer s.ctrl.Finish()

	const (
		username     = "john.doe"
		runtimeId    = "1234"
		runtimeName  = "Runtime 1"
		runtimeImage = "konstellation/image"
		runtimeTag   = "3.9"
	)

	ctx := context.Background()

	expectedRuntime := entity.NewRuntime(runtimeId, runtimeName, runtimeImage, runtimeTag)

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
		genRuntimeId = "5678"
		runtimeName  = "Runtime 1"
		runtimeImage = "konstellation/image"
		runtimeTag   = "3.9"
	)

	ctx := context.Background()

	expectedGenericRuntimes := []entity.Runtime{
		entity.NewRuntime(genRuntimeId, runtimeName, runtimeImage, runtimeTag),
	}

	s.mocks.repo.EXPECT().FindAll(ctx).Return(expectedGenericRuntimes, nil)

	f, err := s.interactor.GetRuntimes(ctx)

	require.NoError(t, err)
	require.Equal(t, f, expectedGenericRuntimes)
}
