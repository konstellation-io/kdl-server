package kgservice

import (
	"context"

	"google.golang.org/grpc"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	kgpb "github.com/konstellation-io/kdl-server/app/api/infrastructure/kgservice/proto"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
)

const (
	kgPaper = "paper"
	kgRepo  = "code"
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

// GetGraph gets a Knowledge Graph from the server.
func (kg *kgService) GetGraph(ctx context.Context, description string) (entity.KnowledgeGraph, error) {
	req := kgpb.GetGraphReq{Description: description}
	res, err := kg.client.GetGraph(ctx, &req)

	if err != nil {
		return entity.KnowledgeGraph{}, err
	}

	items := make([]entity.KnowledgeGraphItem, len(res.Items))

	for i, value := range res.Items {
		externalID := &value.ExternalId
		if value.ExternalId == "" {
			externalID = nil
		}

		framework := &value.Framework
		if value.Framework == "" {
			framework = nil
		}

		var cat entity.KnowledgeGraphItemCat

		switch value.Category {
		case kgPaper:
			cat = entity.KnowledgeGraphItemCatPaper
		case kgRepo:
			cat = entity.KnowledgeGraphItemCatCode
		}

		items[i] = entity.KnowledgeGraphItem{
			ID:       value.Id,
			Category: cat,
			Title:    value.Title,
			Abstract: value.Abstract,
			Authors:  value.Authors,
			Score:    value.Score,
			Date:     value.Date,
			URL:      value.Url,
			// TODO check if this has to be implemented for demo
			IsStarred:   false,
			IsDiscarded: false,
			ExternalID:  externalID,
			Framework:   framework,
		}
	}

	return entity.KnowledgeGraph{Items: items}, nil
}
