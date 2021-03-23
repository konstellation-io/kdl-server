package kgservice

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"google.golang.org/grpc"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	kgpb "github.com/konstellation-io/kdl-server/app/api/infrastructure/kgservice/proto"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
)

var (
	ErrInvalidCategory = errors.New("invalid knowledge graph item category")
)

type kgService struct {
	logger logging.Logger
	client kgpb.KGServiceClient
}

func NewKGService(logger logging.Logger, url string) (KGService, error) {
	cc, err := grpc.Dial(url, grpc.WithInsecure())
	if err != nil {
		return nil, err
	}

	client := kgpb.NewKGServiceClient(cc)

	return &kgService{
		logger: logger,
		client: client,
	}, nil
}

// GetGraph gets a entity.KnowledgeGraph from the server for a given description.
func (kg *kgService) GetGraph(ctx context.Context, description string) (entity.KnowledgeGraph, error) {
	req := kgpb.GetGraphReq{Description: description}
	res, err := kg.client.GetGraph(ctx, &req)

	if err != nil {
		return entity.KnowledgeGraph{}, err
	}

	items := make([]entity.KnowledgeGraphItem, len(res.Items))

	for i, value := range res.Items {
		cat, err := parseValidateCategory(value)
		if err != nil {
			return entity.KnowledgeGraph{}, err
		}

		items[i] = entity.KnowledgeGraphItem{
			ID:         value.Id,
			Category:   cat,
			Title:      value.Title,
			Abstract:   value.Abstract,
			Authors:    value.Authors,
			Score:      float64(value.Score),
			Date:       value.Date,
			URL:        value.Url,
			Topics:     convertTopics(value.Topics),
			IsStarred:  false,
			RepoURLs:   value.RepoUrls,
			ExternalID: stringToPointer(value.ExternalId),
			Frameworks: value.Frameworks,
		}
	}

	topics := convertTopics(res.Topics)

	return entity.KnowledgeGraph{Items: items, Topics: topics}, nil
}

// GetItem gets a entity.KnowledgeGraphItem for a given id
func (kg *kgService) GetItem(ctx context.Context, id string) (entity.KnowledgeGraphItem, error) {
	req := kgpb.GetItemReq{Id: id}

	res, err := kg.client.GetItem(ctx, &req)
	if err != nil {
		return entity.KnowledgeGraphItem{}, err
	}

	cat, err := parseValidateCategory(res.Item)
	if err != nil {
		return entity.KnowledgeGraphItem{}, err
	}

	item := entity.KnowledgeGraphItem{
		ID:         res.Item.Id,
		Category:   cat,
		Title:      res.Item.Title,
		Abstract:   res.Item.Abstract,
		Authors:    res.Item.Authors,
		Score:      float64(res.Item.Score),
		Date:       res.Item.Date,
		URL:        res.Item.Url,
		Topics:     convertTopics(res.Item.Topics),
		IsStarred:  false,
		RepoURLs:   res.Item.RepoUrls,
		ExternalID: stringToPointer(res.Item.ExternalId),
		Frameworks: res.Item.Frameworks,
	}

	return item, nil
}

// DescriptionQuality gets the quality score of a given description
func (kg *kgService) DescriptionQuality(ctx context.Context, description string) (float64, error) {
	req := kgpb.DescriptionQualityReq{Description: description}

	res, err := kg.client.GetDescriptionQuality(ctx, &req)
	if err != nil {
		return 0, err
	}

	return float64(res.QualityScore), nil
}

func stringToPointer(s string) *string {
	if s == "" {
		return nil
	}

	return &s
}

func convertTopics(topics []*kgpb.Topic) []entity.Topic {
	converted := make([]entity.Topic, len(topics))

	for i, t := range topics {
		converted[i] = entity.Topic{
			Name:      t.Name,
			Relevance: float64(t.Relevance),
		}
	}

	return converted
}

func parseValidateCategory(item *kgpb.GraphItem) (entity.KnowledgeGraphItemCat, error) {
	cat := entity.KnowledgeGraphItemCat(strings.Title(item.Category))

	var err error
	err = nil

	if !cat.IsValid() {
		err = fmt.Errorf("%w: category \"%s\"", ErrInvalidCategory, item.Category)
	}

	return cat, err
}
