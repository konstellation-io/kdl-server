package capabilities_test

import (
	"context"
	"testing"

	"github.com/konstellation-io/kdl-server/app/api/infrastructure/config"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/graph/model"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/k8s"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
	"github.com/konstellation-io/kdl-server/app/api/usecase/capabilities"
)

type capabilitiesSuite struct {
	ctrl       *gomock.Controller
	interactor capabilities.UseCase
	mocks      capabilitiesMocks
}

type capabilitiesMocks struct {
	logger    *logging.MockLogger
	cfg       config.Config
	repo      *capabilities.MockRepository
	k8sClient *k8s.MockClient
}

func newCapabilitiesSuite(t *testing.T, cfg *config.Config) *capabilitiesSuite {
	ctrl := gomock.NewController(t)
	logger := logging.NewMockLogger(ctrl)
	repo := capabilities.NewMockRepository(ctrl)
	k8sClient := k8s.NewMockClient(ctrl)

	logging.AddLoggerExpects(logger)

	if cfg == nil {
		cfg = &config.Config{}
	}

	interactor := capabilities.NewInteractor(logger, *cfg, repo, k8sClient)

	return &capabilitiesSuite{
		ctrl:       ctrl,
		interactor: interactor,
		mocks: capabilitiesMocks{
			logger:    logger,
			cfg:       *cfg,
			repo:      repo,
			k8sClient: k8sClient,
		},
	}
}

func TestInteractor_GetAllCapabilities(t *testing.T) {
	s := newCapabilitiesSuite(t, nil)
	defer s.ctrl.Finish()

	const (
		capabilitiesID   = "test_id"
		capabilitiesName = "Test capabilities 1"
	)

	nodeSelectors := map[string]string{
		"key1": "value1",
	}
	tolerations := []map[string]interface{}{}
	affinities := map[string]interface{}{}
	ctx := context.Background()

	returnedCapabilities := entity.Capabilities{
		ID:            capabilitiesID,
		Name:          capabilitiesName,
		NodeSelectors: nodeSelectors,
		Tolerations:   tolerations,
		Affinities:    affinities,
	}
	expectedCapabilities := model.Capability{
		ID:   capabilitiesID,
		Name: capabilitiesName,
	}

	s.mocks.repo.EXPECT().FindAll(ctx).Return([]entity.Capabilities{returnedCapabilities}, nil)

	createdCapabilities, err := s.interactor.GetCapabilities(ctx)

	require.NoError(t, err)
	require.Equal(t, []model.Capability{expectedCapabilities}, createdCapabilities)
}
