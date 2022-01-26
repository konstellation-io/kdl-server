package repository

import (
	"context"
	"errors"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
	"github.com/konstellation-io/kdl-server/app/api/pkg/mongodb"
	"github.com/konstellation-io/kdl-server/app/api/usecase/runtime"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

const (
	runtimesCollName = "runtimes"
)

type runtimeDTO struct {
	RuntimeID   primitive.ObjectID `bson:"runtime_id"`
	Name        string             `bson:"name"`
	Desc        string             `bson:"desc"`
	Labels      []string           `bson:"labels"`
	DockerImage string             `bson:"docker_image"`
}

type runtimeMongoDBRepo struct {
	logger     logging.Logger
	collection *mongo.Collection
}

func (m *runtimeMongoDBRepo) Get(ctx context.Context, id string) (entity.Runtime, error) {
	idFromHex, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return entity.Runtime{}, err
	}

	return m.findOne(ctx, bson.M{"runtime_id": idFromHex})
}

func (m *runtimeMongoDBRepo) findOne(ctx context.Context, filters bson.M) (entity.Runtime, error) {
	m.logger.Debugf("Finding one runtime by \"%s\" from database...", filters)

	dto := runtimeDTO{}

	err := m.collection.FindOne(ctx, filters).Decode(&dto)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return entity.Runtime{}, entity.RuntimeNotFound
	}

	return m.dtoToEntity(dto), err
}

// FindAll retrieves all projects.
func (m *runtimeMongoDBRepo) FindAll(ctx context.Context) ([]entity.Runtime, error) {
	return m.find(ctx, bson.M{})
}

func (m *runtimeMongoDBRepo) find(ctx context.Context, filters bson.M) ([]entity.Runtime, error) {
	m.logger.Debugf("Finding runtimes with filters \"%s\"...", filters)

	var dtos []runtimeDTO

	err := mongodb.Find(ctx, filters, m.collection, &dtos)
	if err != nil {
		return nil, err
	}

	return m.dtosToEntities(dtos), nil
}

func (m *runtimeMongoDBRepo) runtimesToDTOs(runtimes []entity.Runtime) ([]runtimeDTO, error) {
	dtos := make([]runtimeDTO, len(runtimes))

	for i, f := range runtimes {
		idFromHex, err := primitive.ObjectIDFromHex(f.ID)
		if err != nil {
			return nil, err
		}

		dtos[i] = runtimeDTO{
			RuntimeID:   idFromHex,
			Name:        f.Name,
			Desc:        f.Desc,
			Labels:      f.Labels,
			DockerImage: f.DockerImage,
		}
	}

	return dtos, nil
}

func (m *runtimeMongoDBRepo) dtoToEntity(dto runtimeDTO) entity.Runtime {
	p := entity.Runtime{
		ID:          dto.RuntimeID.Hex(),
		Name:        dto.Name,
		Desc:        dto.Desc,
		Labels:      dto.Labels,
		DockerImage: dto.DockerImage,
	}

	return p
}

func (m *runtimeMongoDBRepo) dtosToEntities(dtos []runtimeDTO) []entity.Runtime {
	result := make([]entity.Runtime, len(dtos))

	for i, dto := range dtos {
		result[i] = m.dtoToEntity(dto)
	}

	return result
}

// NewRuntimeMongoDBRepo implements runtimes.Repository interface.
func NewRuntimeMongoDBRepo(logger logging.Logger, client *mongo.Client, dbName string) runtime.Repository {
	collection := client.Database(dbName).Collection(runtimesCollName)
	return &runtimeMongoDBRepo{logger, collection}
}
