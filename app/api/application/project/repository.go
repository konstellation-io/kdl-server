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
	project := projectDTO{}

	idFromHex, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return entity.Project{}, err
	}

	err = p.collection.FindOne(ctx, bson.M{"_id": idFromHex}).Decode(&project)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return entity.Project{}, entity.ErrProjectNotFound
	}

	return p.dtoToEntity(project), err
}

func (p MongoDBRepo) Create(ctx context.Context, project entity.Project) (string, error) {
	dto, err := p.entityToDTO(project)
	if err != nil {
		return "", err
	}
	dto.ID = primitive.NewObjectID()

	result, err := p.collection.InsertOne(ctx, dto)
	if err != nil {
		return "", err
	}

	return result.InsertedID.(primitive.ObjectID).Hex(), nil
}

type projectDTO struct {
	ID          primitive.ObjectID `bson:"_id"`
	Name        string             `bson:"name"`
	Description string             `bson:"description"`
}

func (p MongoDBRepo) entityToDTO(project entity.Project) (projectDTO, error) {
	dto := projectDTO{
		Name:        project.Name,
		Description: project.Description,
	}

	if project.ID != "" {
		idFromHex, err := primitive.ObjectIDFromHex(project.ID)
		if err != nil {
			return dto, err
		}
		dto.ID = idFromHex
	}

	return dto, nil
}

func (p MongoDBRepo) dtoToEntity(project projectDTO) entity.Project {
	return entity.Project{
		ID:          project.ID.Hex(),
		Name:        project.Name,
		Description: project.Description,
	}
}
