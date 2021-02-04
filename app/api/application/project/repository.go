package project

import (
	"context"
	"errors"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

const projectCollName = "projects"

type MongoDBRepo struct {
	collection *mongo.Collection
}

func NewMongoDBRepo(client *mongo.Client, dbName string) *MongoDBRepo {
	collection := client.Database(dbName).Collection(projectCollName)
	return &MongoDBRepo{collection}
}

func (p MongoDBRepo) Get(ctx context.Context, id string) (entity.Project, error) {
	project := entity.Project{}

	idFromHex, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return project, err
	}

	err = p.collection.FindOne(ctx, bson.M{"_id": idFromHex}).Decode(&project)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return project, entity.ErrProjectNotFound
	}

	return project, err
}

func (p MongoDBRepo) Create(ctx context.Context, project entity.Project) (string, error) {
	result, err := p.collection.InsertOne(ctx, project)
	if err != nil {
		return "", err
	}

	return result.InsertedID.(primitive.ObjectID).String(), nil
}
