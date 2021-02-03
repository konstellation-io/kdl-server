package project

import (
	"context"
	"github.com/konstellation-io/kdl-server/app/api/entity"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

const projectCollName = "projects"

type ProjectRepo struct {
	collection *mongo.Collection
}

func NewProjectRepo(client *mongo.Client, dbName string) *ProjectRepo {
	collection := client.Database(dbName).Collection(projectCollName)
	return &ProjectRepo{collection}
}

func (p ProjectRepo) Get(ctx context.Context, id string) (entity.Project, error) {
	project := entity.Project{}
	idFromHex, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return project, err
	}
	filter := bson.M{"_id": idFromHex}
	err = p.collection.FindOne(ctx, filter).Decode(&project)
	if err == mongo.ErrNoDocuments {
		return project, entity.ErrProjectNotFound
	}
	return project, err
}

func (p ProjectRepo) Create(ctx context.Context, project entity.Project) (string, error) {
	result, err := p.collection.InsertOne(ctx, project)
	if err != nil {
		return "", err
	}
	return result.InsertedID.(primitive.ObjectID).String(), nil
}
