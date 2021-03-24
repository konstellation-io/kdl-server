package kgservice

import (
	"context"

	"github.com/konstellation-io/kdl-server/app/api/entity"
)

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

// KGService interface defines all Knowledge Graph operations.
type KGService interface {
	GetGraph(ctx context.Context, description string) (entity.KnowledgeGraph, error)
	GetItem(ctx context.Context, id string) (entity.KnowledgeGraphItem, error)
	DescriptionQuality(ctx context.Context, description string) (int, error)
}
