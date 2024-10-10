package mongodb

import (
	"context"
	"errors"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
	"github.com/konstellation-io/kdl-server/app/api/pkg/mongodbutils"
	"github.com/konstellation-io/kdl-server/app/api/usecase/runtime"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

const (
	runtimesCollName = "runtimes"
)

type runtimeDTO struct {
	ID          primitive.ObjectID `bson:"_id"`
	Name        string             `bson:"name"`
	Desc        string             `bson:"desc"`
	Labels      []string           `bson:"labels"`
	DockerImage string             `bson:"docker_image"`
	DockerTag   string             `bson:"docker_tag"`
}

type RuntimeRepo struct {
	logger     logging.Logger
	collection *mongo.Collection
}

// RuntimeRepo implements the runtime.Repository interface.
var _ runtime.Repository = (*RuntimeRepo)(nil)

// NewRuntimeRepo implements runtimes.Repository interface.
func NewRuntimeRepo(logger logging.Logger, client *mongo.Client, dbName string) *RuntimeRepo {
	collection := client.Database(dbName).Collection(runtimesCollName)
	return &RuntimeRepo{logger, collection}
}

// Create inserts into the database a new runtime entity.
// This Create is not exposed to the API, it's only used internally for testing.
func (m *RuntimeRepo) Create(ctx context.Context, r entity.Runtime) (string, error) {
	m.logger.Debugf("Creating new runtime %q...", r.Name)

	dto, err := m.entityToDTO(r)
	if err != nil {
		return "", err
	}

	result, err := m.collection.InsertOne(ctx, dto)
	if err != nil {
		return "", err
	}

	return result.InsertedID.(primitive.ObjectID).Hex(), nil
}

func (m *RuntimeRepo) Get(ctx context.Context, id string) (entity.Runtime, error) {
	idFromHex, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return entity.Runtime{}, err
	}

	return m.findOne(ctx, bson.M{"_id": idFromHex})
}

func (m *RuntimeRepo) findOne(ctx context.Context, filters bson.M) (entity.Runtime, error) {
	m.logger.Debugf("Finding one runtime by %q from database...", filters)

	dto := runtimeDTO{}

	err := m.collection.FindOne(ctx, filters).Decode(&dto)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return entity.Runtime{}, entity.ErrRuntimeNotFound
	}

	return m.dtoToEntity(dto), err
}

// FindAll retrieves all projects.
func (m *RuntimeRepo) FindAll(ctx context.Context) ([]entity.Runtime, error) {
	return m.find(ctx, bson.M{})
}

func (m *RuntimeRepo) find(ctx context.Context, filters bson.M) ([]entity.Runtime, error) {
	m.logger.Debugf("Finding runtimes with filters %q...", filters)

	var dtos []runtimeDTO

	err := mongodbutils.Find(ctx, filters, m.collection, &dtos)
	if err != nil {
		return nil, err
	}

	return m.dtosToEntities(dtos), nil
}

func (m *RuntimeRepo) dtoToEntity(dto runtimeDTO) entity.Runtime {
	p := entity.Runtime{
		ID:          dto.ID.Hex(),
		Name:        dto.Name,
		Desc:        dto.Desc,
		Labels:      dto.Labels,
		DockerImage: dto.DockerImage,
		DockerTag:   dto.DockerTag,
	}

	return p
}

func (m *RuntimeRepo) dtosToEntities(dtos []runtimeDTO) []entity.Runtime {
	result := make([]entity.Runtime, len(dtos))

	for i, dto := range dtos {
		result[i] = m.dtoToEntity(dto)
	}

	return result
}

func (m *RuntimeRepo) entityToDTO(r entity.Runtime) (runtimeDTO, error) {
	objectID, err := primitive.ObjectIDFromHex(r.ID)
	if err != nil {

		return runtimeDTO{}, err
	}

	dto := runtimeDTO{
		ID:          objectID,
		Name:        r.Name,
		Desc:        r.Desc,
		Labels:      r.Labels,
		DockerImage: r.DockerImage,
		DockerTag:   r.DockerTag,
	}

	return dto, nil
}
