package kg_test

import (
	"context"
	"testing"
	"time"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/kgservice"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
	"github.com/konstellation-io/kdl-server/app/api/usecase/kg"
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

func TestInteractor_Graph(t *testing.T) {
	k := newKGSuite(t)
	defer k.ctrl.Finish()

	var (
		projectTest = entity.Project{
			ID:                 "1",
			Name:               "Test",
			Description:        "Test",
			CreationDate:       time.Time{},
			LastActivationDate: "",
			Favorite:           false,
			Error:              nil,
			Repository:         entity.Repository{},
			Members:            nil,
			StarredKGItems:     []string{"4567"},
		}
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
		Starred:    false,
	}, {
		ID:         "4567",
		Category:   "Code",
		Title:      "Test Item",
		Abstract:   "abstract 2",
		Authors:    authors,
		Date:       "2020-01-21",
		URL:        "http://test.com",
		ExternalID: nil,
		RepoURLs:   nil,
		Frameworks: nil,
		Topics:     nil,
		Score:      0.05,
		Starred:    false,
	},
	}

	expectedKG := entity.KnowledgeGraph{
		Items: kgItems,
	}

	k.mocks.kgService.EXPECT().Graph(ctx, projectTest.Description).Return(expectedKG, nil)
	getKG, err := k.interactor.Graph(ctx, projectTest)

	require.NoError(t, err)
	require.Equal(t, getKG.Items[0], expectedKG.Items[0])
	require.True(t, getKG.Items[1].Starred)
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
