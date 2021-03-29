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

// Get returns the knowledge graph for the desired description.
func (i *interactor) Get(ctx context.Context, description string) (entity.KnowledgeGraph, error) {
	i.logger.Infof("Getting KG with description \"%s\"", description)
	return i.kgService.GetGraph(ctx, description)
}

// GetItem gets an item for a given id.
func (i *interactor) GetItem(ctx context.Context, id string) (entity.KnowledgeGraphItem, error) {
	i.logger.Infof("Getting KG item with id \"%s\"", id)
	return i.kgService.GetItem(ctx, id)
}

// DescriptionQuality gets description quality.
func (i *interactor) DescriptionQuality(ctx context.Context, description string) (int, error) {
	i.logger.Infof("Getting quality of description  \"%s\"", description)
	return i.kgService.DescriptionQuality(ctx, description)
}
