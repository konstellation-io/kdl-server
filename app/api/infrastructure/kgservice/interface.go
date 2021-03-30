package kgservice

import (
	"context"

	"github.com/konstellation-io/kdl-server/app/api/entity"
)

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

// KGService interface defines all Knowledge Graph operations.
type KGService interface {
	Graph(ctx context.Context, description string) (entity.KnowledgeGraph, error)
	DescriptionQuality(ctx context.Context, description string) (int, error)
}
