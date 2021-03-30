package kg

import (
	"context"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/kgservice"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
)

// interactor implements the UseCase interface.
type interactor struct {
	logger    logging.Logger
	kgService kgservice.KGService
}

// NewInteractor is a constructor function.
func NewInteractor(logger logging.Logger, kgService kgservice.KGService) UseCase {
	return &interactor{logger: logger, kgService: kgService}
}

// Graph returns the knowledge graph for the desired description.
func (i *interactor) Graph(ctx context.Context, project entity.Project) (entity.KnowledgeGraph, error) {
	i.logger.Infof("Getting KG for project \"%s\"", project.ID)

	graph, err := i.kgService.Graph(ctx, project.Description)
	if err != nil {
		return entity.KnowledgeGraph{}, nil
	}

	starred := project.StarredKGItems

	for idx, item := range graph.Items {
		for _, id := range starred {
			if item.ID == id {
				graph.Items[idx].Starred = true
			}
		}
	}

	return graph, nil
}

// DescriptionQuality gets description quality.
func (i *interactor) DescriptionQuality(ctx context.Context, description string) (int, error) {
	i.logger.Infof("Getting quality of description  \"%s\"", description)
	return i.kgService.DescriptionQuality(ctx, description)
}
