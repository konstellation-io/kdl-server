package runtime_test

import (
	"context"
	"errors"
	"testing"

	"github.com/go-logr/logr"
	"github.com/go-logr/zapr"
	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/k8s"
	"github.com/konstellation-io/kdl-server/app/api/usecase/runtime"
)

var errUnknown = errors.New("unknown error")

type Runtimesuite struct {
	ctrl       *gomock.Controller
	interactor runtime.UseCase
	mocks      flavorMocks
}
type flavorMocks struct {
	logger   logr.Logger
	repo     *runtime.MockRepository
	k8client *k8s.MockClientInterface
}

func newRuntimesuite(t *testing.T) *Runtimesuite {
	zapLog, err := zap.NewDevelopment()
	require.NoError(t, err)

	logger := zapr.NewLogger(zapLog)

	ctrl := gomock.NewController(t)
	repo := runtime.NewMockRepository(ctrl)
	k8client := k8s.NewMockClientInterface(ctrl)
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
		username         = "john.doe"
		runtimeID        = "1234"
		runtimeName      = "Runtime 1"
		runtimeImage     = "konstellation/image"
		runtimeTag       = "3.9"
		runtimePodStatus = entity.PodStatusRunning
	)

	ctx := context.Background()

	expectedRuntime := entity.NewRuntime(runtimeID, runtimeName, runtimeImage, runtimeTag)
	expectedRuntime.RuntimePod = "usertools-" + username + "-user-tools-0"
	expectedRuntime.RuntimePodStatus = runtimePodStatus

	s.mocks.k8client.EXPECT().GetRuntimeIDFromUserTools(ctx, username).Return(runtimeID, nil)
	s.mocks.k8client.EXPECT().GetUserToolsPodStatus(ctx, username).Return(runtimePodStatus, nil)
	s.mocks.repo.EXPECT().Get(ctx, runtimeID).Return(expectedRuntime, nil)

	f, err := s.interactor.GetRunningRuntime(ctx, username)

	require.NoError(t, err)
	require.Equal(t, &expectedRuntime, f)
}

func TestInteractor_GetRunningRuntime_GetUserToolsPodStatusError(t *testing.T) {
	s := newRuntimesuite(t)
	defer s.ctrl.Finish()

	const (
		username         = "john.doe"
		runtimeID        = "1234"
		runtimeName      = "Runtime 1"
		runtimeImage     = "konstellation/image"
		runtimeTag       = "3.9"
		runtimePodStatus = entity.PodStatusUnknown
	)

	ctx := context.Background()

	expectedRuntime := entity.NewRuntime(runtimeID, runtimeName, runtimeImage, runtimeTag)
	expectedRuntime.RuntimePod = "usertools-" + username + "-user-tools-0"
	expectedRuntime.RuntimePodStatus = runtimePodStatus

	s.mocks.k8client.EXPECT().GetRuntimeIDFromUserTools(ctx, username).Return(runtimeID, nil)
	s.mocks.k8client.EXPECT().GetUserToolsPodStatus(ctx, username).Return(entity.PodStatusUnknown, errUnknown)
	s.mocks.repo.EXPECT().Get(ctx, runtimeID).Return(expectedRuntime, nil)

	f, err := s.interactor.GetRunningRuntime(ctx, username)

	require.NoError(t, err)
	require.Equal(t, &expectedRuntime, f)
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
	require.ElementsMatch(t, expectedGenericRuntimes, f)
}
