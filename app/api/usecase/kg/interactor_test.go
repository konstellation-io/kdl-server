package kg_test

import (
	"context"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/kgservice"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
	"github.com/konstellation-io/kdl-server/app/api/usecase/kg"
	"github.com/stretchr/testify/require"
)

type kgSuite struct {
	ctrl       *gomock.Controller
	interactor kg.UseCase
	mocks      kgMocks
}

type kgMocks struct {
	logger    *logging.MockLogger
	kgService *kgservice.MockKGService
}

func newKGSuite(t *testing.T) *kgSuite {
	ctrl := gomock.NewController(t)

	logger := logging.NewMockLogger(ctrl)
	logging.AddLoggerExpects(logger)

	kgService := kgservice.NewMockKGService(ctrl)

	interactor := kg.NewInteractor(logger, kgService)

	return &kgSuite{
		ctrl:       ctrl,
		interactor: interactor,
		mocks: kgMocks{
			logger:    logger,
			kgService: kgService,
		},
	}
}

func TestInteractor_Get(t *testing.T) {
	k := newKGSuite(t)
	defer k.ctrl.Finish()

	const (
		description = "awesome amazing"
	)

	ctx := context.Background()
	authors := []string{"a", "b"}
	kgItems := []entity.KnowledgeGraphItem{{
		ID:       "1234",
		Category: entity.KnowledgeGraphItemCatPaper,
		Title:    "title",
		Abstract: "abstract",
		Authors:  authors,
		Date:     "date",
		URL:      "url",
		Topics: []entity.Topic{{
			Name:      "test",
			Relevance: 0.1,
		}},
		ExternalID: nil,
		Frameworks: []string{"tf"},
		Score:      0,
		IsStarred:  false,
	}}

	expectedKG := entity.KnowledgeGraph{
		Items: kgItems,
	}

	k.mocks.kgService.EXPECT().GetGraph(ctx, description).Return(expectedKG, nil)
	getKG, err := k.interactor.Get(ctx, description)

	require.NoError(t, err)
	require.Equal(t, getKG, expectedKG)
}

func TestInteractor_GetItem(t *testing.T) {
	k := newKGSuite(t)
	defer k.ctrl.Finish()

	const (
		ID = "12345"
	)

	ctx := context.Background()
	authors := []string{"a", "b"}
	kgItem := entity.KnowledgeGraphItem{
		ID:       "12345",
		Category: entity.KnowledgeGraphItemCatPaper,
		Title:    "title",
		Abstract: "abstract",
		Authors:  authors,
		Date:     "date",
		URL:      "url",
		Topics: []entity.Topic{{
			Name:      "test",
			Relevance: 0.1,
		}},
		ExternalID: nil,
		Frameworks: []string{"tf"},
		Score:      0,
		IsStarred:  false,
	}

	k.mocks.kgService.EXPECT().GetItem(ctx, ID).Return(kgItem, nil)
	getItem, err := k.interactor.GetItem(ctx, ID)

	require.NoError(t, err)
	require.Equal(t, getItem, kgItem)
}

func TestInteractor_DescriptionQuality(t *testing.T) {
	k := newKGSuite(t)
	defer k.ctrl.Finish()

	ctx := context.Background()

	const (
		description = "awesome amazing"
	)

	expectedScore := 90

	k.mocks.kgService.EXPECT().DescriptionQuality(ctx, description).Return(expectedScore, nil)
	quality, err := k.interactor.DescriptionQuality(ctx, description)

	require.NoError(t, err)
	require.Equal(t, quality, expectedScore)
}
