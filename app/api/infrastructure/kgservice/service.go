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

// GetGraph gets a Knowledge Graph from the server.
func (kg *kgService) GetGraph(ctx context.Context, description string) (entity.KnowledgeGraph, error) {
	req := kgpb.GetGraphReq{Description: description}
	res, err := kg.client.GetGraph(ctx, &req)

	if err != nil {
		return entity.KnowledgeGraph{}, err
	}

	items := make([]entity.KnowledgeGraphItem, len(res.Items))

	for i, value := range res.Items {
		cat := entity.KnowledgeGraphItemCat(strings.Title(value.Category))
		if !cat.IsValid() {
			err = fmt.Errorf("%w: category \"%s\"", ErrInvalidCategory, value.Category)
			return entity.KnowledgeGraph{}, err
		}

		items[i] = entity.KnowledgeGraphItem{
			ID:          value.Id,
			Category:    cat,
			Title:       value.Title,
			Abstract:    value.Abstract,
			Authors:     value.Authors,
			Score:       float64(value.Score),
			Date:        value.Date,
			URL:         value.Url,
			IsStarred:   false,
			IsDiscarded: false,
			RepoURLs:    value.RepoUrls,
			ExternalID:  stringToPointer(value.ExternalId),
			Frameworks:  value.Frameworks,
		}
	}

	return entity.KnowledgeGraph{Items: items}, nil
}

func stringToPointer(s string) *string {
	if s == "" {
		return nil
	}

	return &s
}
