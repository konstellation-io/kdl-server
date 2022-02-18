package runtime_test

import (
	"context"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/k8s"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
	"github.com/konstellation-io/kdl-server/app/api/usecase/runtime"
	"github.com/stretchr/testify/require"
)

type Runtimesuite struct {
	ctrl       *gomock.Controller
	interactor runtime.UseCase
	mocks      flavorMocks
}
type flavorMocks struct {
	logger   *logging.MockLogger
	repo     *runtime.MockRepository
	k8client *k8s.MockClient
}

func newRuntimesuite(t *testing.T) *Runtimesuite {
	ctrl := gomock.NewController(t)
	logger := logging.NewMockLogger(ctrl)
	repo := runtime.NewMockRepository(ctrl)
	k8client := k8s.NewMockClient(ctrl)
	interactor := runtime.NewInteractor(logger, k8client, repo)

	logging.AddLoggerExpects(logger)

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
		runtimeID    = "1234"
		runtimeName  = "Runtime 1"
		runtimeImage = "konstellation/image"
		runtimeTag   = "3.9"
	)

	ctx := context.Background()

	expectedRuntime := entity.NewRuntime(runtimeID, runtimeName, runtimeImage, runtimeTag)
	expectedRuntime.RuntimePod = "usertools-" + username + "-user-tools-0"

	s.mocks.k8client.EXPECT().GetRuntimeIDFromUserTools(ctx, username).Return(runtimeID, nil)
	s.mocks.repo.EXPECT().Get(ctx, runtimeID).Return(expectedRuntime, nil)

	f, err := s.interactor.GetRunningRuntime(ctx, username)

	require.NoError(t, err)
	require.Equal(t, f, &expectedRuntime)
}

func TestInteractor_GetProjectRuntimes(t *testing.T) {
	s := newRuntimesuite(t)
	defer s.ctrl.Finish()

	const (
		genRuntimeID = "5678"
		runtimeName  = "Runtime 1"
		runtimeImage = "konstellation/image"
		runtimeTag   = "3.9"
		username     = "jhondoe"
	)

	ctx := context.Background()

	expectedGenericRuntimes := []entity.Runtime{
		entity.NewRuntime(genRuntimeID, runtimeName, runtimeImage, runtimeTag),
	}

	s.mocks.repo.EXPECT().FindAll(ctx).Return(expectedGenericRuntimes, nil)

	f, err := s.interactor.GetRuntimes(ctx, username)

	require.NoError(t, err)
	require.Equal(t, f, expectedGenericRuntimes)
}
