package repository

import (
	"context"
	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
	"github.com/konstellation-io/kdl-server/app/api/pkg/mongodb"
	"github.com/konstellation-io/kdl-server/app/api/usecase/flavor"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

const (
	flavorsCollName         = "flavors"
)

type flavorDTO struct {
	FlavorID primitive.ObjectID `bson:"flavor_id"`
	Name     string             `bson:"name"`
	Running  bool               `bson:"running"`
}

type flavorMongoDBRepo struct {
	logger     logging.Logger
	collection *mongo.Collection
}

// FindAll retrieves all projects.
func (m *flavorMongoDBRepo) FindAll(ctx context.Context) ([]entity.Flavor, error) {
	return m.find(ctx, bson.M{})
}

func (m *flavorMongoDBRepo) find(ctx context.Context, filters bson.M) ([]entity.Flavor, error) {
	m.logger.Debugf("Finding flavors with filters \"%s\"...", filters)

	var dtos []flavorDTO

	err := mongodb.Find(ctx, filters, m.collection, &dtos)
	if err != nil {
		return nil, err
	}

	return m.dtosToEntities(dtos), nil
}

func (m *flavorMongoDBRepo) flavorsToDTOs(flavors []entity.Flavor) ([]flavorDTO, error) {
	dtos := make([]flavorDTO, len(flavors))

	for i, f := range flavors {
		idFromHex, err := primitive.ObjectIDFromHex(f.ID)
		if err != nil {
			return nil, err
		}

		dtos[i] = flavorDTO{
			FlavorID: idFromHex,
			Name:     f.Name,
			Running:  f.Running,
		}
	}

	return dtos, nil
}

func (m *flavorMongoDBRepo) dtoToEntity(dto flavorDTO) entity.Flavor {
	p := entity.Flavor{
		ID:      dto.FlavorID.Hex(),
		Name:    dto.Name,
		Running: dto.Running,
	}

	return p
}

func (m *flavorMongoDBRepo) dtosToEntities(dtos []flavorDTO) []entity.Flavor {
	result := make([]entity.Flavor, len(dtos))

	for i, dto := range dtos {
		result[i] = m.dtoToEntity(dto)
	}

	return result
}

// NewFlavorMongoDBRepo implements flavors.Repository interface.
func NewFlavorMongoDBRepo(logger logging.Logger, client *mongo.Client, dbName string) flavor.Repository {
	collection := client.Database(dbName).Collection(flavorsCollName)
	return &flavorMongoDBRepo{logger, collection}
}
