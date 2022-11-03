package repository

import (
	"context"
	"errors"

	"github.com/konstellation-io/kdl-server/app/api/usecase/capabilities"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

const capabilitiesCollName = "capabilities"

type capabilityDTO struct {
	ID         primitive.ObjectID  `bson:"_id"`
	Capability entity.Capabilities `bson:"capabilities"`
}

type capabilitiesMongoDBRepo struct {
	logger     logging.Logger
	collection *mongo.Collection
}

// NewCapabilitiesMongoDBRepo implements project.Repository interface.
func NewCapabilitiesMongoDBRepo(logger logging.Logger, client *mongo.Client, dbName string) capabilities.Repository {
	collection := client.Database(dbName).Collection(capabilitiesCollName)
	return &capabilitiesMongoDBRepo{logger, collection}
}

// Get retrieves a capabilities struct using an identifier.
func (m *capabilitiesMongoDBRepo) Get(ctx context.Context, id string) (entity.Capabilities, error) {
	cap := entity.Capabilities{}

	response := m.collection.FindOne(ctx, bson.M{"_id": id})
	if err := response.Err(); errors.Is(err, mongo.ErrNoDocuments) {
		return cap, entity.ErrCapabilitiesNotFound
	} else if err != nil {
		return cap, err
	}

	err := response.Decode(&cap)
	if response.Err() != nil {
		return cap, err
	}

	return cap, nil
}

// FindAll retrieves all capabilities.
func (m *capabilitiesMongoDBRepo) FindAll(ctx context.Context) ([]entity.Capabilities, error) {
	caps := []entity.Capabilities{}

	response, err := m.collection.Find(ctx, bson.M{})
	if errors.Is(err, mongo.ErrNoDocuments) {
		return caps, entity.ErrCapabilitiesNotFound
	} else if err != nil {
		return caps, err
	}

	err = response.Decode(&caps)
	if response.Err() != nil {
		return caps, err
	}

	return caps, nil
}
