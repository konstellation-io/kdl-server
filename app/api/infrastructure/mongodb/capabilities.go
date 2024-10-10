package mongodb

import (
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
	"github.com/konstellation-io/kdl-server/app/api/pkg/mongodbutils"
	"github.com/konstellation-io/kdl-server/app/api/usecase/capabilities"
)

type capabilitiesDTO struct {
	ID            string                   `bson:"_id"`
	Name          string                   `bson:"name"`
	Default       bool                     `bson:"default"`
	NodeSelectors map[string]string        `bson:"node_selectors"`
	Tolerations   []map[string]interface{} `bson:"tolerations"`
	Affinities    map[string]interface{}   `bson:"affinities"`
}

const capabilitiesCollName = "capabilities"

type CapabilitiesRepo struct {
	logger     logging.Logger
	collection *mongo.Collection
}

// capabilitiesRepo implements the capabilities.Repository interface.
var _ capabilities.Repository = (*CapabilitiesRepo)(nil)

func NewCapabilitiesRepo(logger logging.Logger, client *mongo.Client, dbName string) *CapabilitiesRepo {
	collection := client.Database(dbName).Collection(capabilitiesCollName)
	return &CapabilitiesRepo{logger, collection}
}

// Create inserts into the database a new capabilities entity.
// This Create is not exposed to the API, it's only used internally for testing.
func (m *CapabilitiesRepo) Create(ctx context.Context, c entity.Capabilities) (string, error) {
	m.logger.Debugf("Creating new capabilities %q...", c.ID)

	dto, err := m.entityToDTO(c)
	if err != nil {
		return "", err
	}

	result, err := m.collection.InsertOne(ctx, dto)
	if err != nil {
		return "", err
	}

	return result.InsertedID.(string), nil
}

// Get retrieves a capabilities struct using an identifier.
func (m *CapabilitiesRepo) Get(ctx context.Context, id string) (entity.Capabilities, error) {
	if id == "" {
		return entity.Capabilities{}, entity.ErrCapabilitiesNotFound
	}

	dto := capabilitiesDTO{}

	err := m.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&dto)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return entity.Capabilities{}, entity.ErrCapabilitiesNotFound
	}

	return m.dtoToEntity(dto), err
}

// FindAll retrieves all the capabilities in the database.
func (m *CapabilitiesRepo) FindAll(ctx context.Context) ([]entity.Capabilities, error) {
	var dtos []capabilitiesDTO

	err := mongodbutils.Find(ctx, bson.M{}, m.collection, &dtos)
	if err != nil {
		return nil, err
	}

	return m.dtosToEntities(dtos), nil
}

func (m *CapabilitiesRepo) dtoToEntity(dto capabilitiesDTO) entity.Capabilities {
	capability := entity.Capabilities{
		ID:            dto.ID,
		Name:          dto.Name,
		Default:       dto.Default,
		NodeSelectors: dto.NodeSelectors,
		Tolerations:   dto.Tolerations,
		Affinities:    dto.Affinities,
	}

	return capability
}

func (m *CapabilitiesRepo) dtosToEntities(dto []capabilitiesDTO) []entity.Capabilities {
	caps := make([]entity.Capabilities, len(dto))

	for i, c := range dto {
		caps[i] = m.dtoToEntity(c)
	}

	return caps
}

func (m *CapabilitiesRepo) entityToDTO(c entity.Capabilities) (capabilitiesDTO, error) {
	dto := capabilitiesDTO{
		ID:            c.ID,
		Name:          c.Name,
		Default:       c.Default,
		NodeSelectors: c.NodeSelectors,
		Tolerations:   c.Tolerations,
		Affinities:    c.Affinities,
	}

	return dto, nil
}
