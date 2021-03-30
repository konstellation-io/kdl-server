package kg

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

import (
	"context"

	"github.com/konstellation-io/kdl-server/app/api/entity"
)

// Knowledge Graph interface to retrieve items.
type UseCase interface {
	Graph(ctx context.Context, project entity.Project) (entity.KnowledgeGraph, error)
	DescriptionQuality(ctx context.Context, description string) (int, error)
}
