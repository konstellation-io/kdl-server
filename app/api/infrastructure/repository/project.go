package repository

import (
	"context"
	"errors"
	"time"

	"github.com/konstellation-io/kdl-server/app/api/usecase/project"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

const projectCollName = "projects"

type projectDTO struct {
	ID           primitive.ObjectID `bson:"_id"`
	Name         string             `bson:"name"`
	Description  string             `bson:"description"`
	CreationDate time.Time          `bson:"creation_date"`
}

type projectMongoDBRepo struct {
	logger     logging.Logger
	collection *mongo.Collection
}

// NewProjectMongoDBRepo implements project.Repository interface.
func NewProjectMongoDBRepo(logger logging.Logger, client *mongo.Client, dbName string) project.Repository {
	collection := client.Database(dbName).Collection(projectCollName)
	return &projectMongoDBRepo{logger, collection}
}

// Get retrieves the project using the identifier.
func (m *projectMongoDBRepo) Get(ctx context.Context, id string) (entity.Project, error) {
	dto := projectDTO{}

	idFromHex, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return entity.Project{}, err
	}

	err = m.collection.FindOne(ctx, bson.M{"_id": idFromHex}).Decode(&dto)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return entity.Project{}, entity.ErrProjectNotFound
	}

	return m.dtoToEntity(dto), err
}

// Create inserts into the database a new entity.
func (m *projectMongoDBRepo) Create(ctx context.Context, p entity.Project) (string, error) {
	dto, err := m.entityToDTO(p)
	if err != nil {
		return "", err
	}

	dto.ID = primitive.NewObjectID()

	result, err := m.collection.InsertOne(ctx, dto)
	if err != nil {
		return "", err
	}

	return result.InsertedID.(primitive.ObjectID).Hex(), nil
}

// FindAll retrieves all the existing projects.
func (m *projectMongoDBRepo) FindAll(ctx context.Context) ([]entity.Project, error) {
	m.logger.Debugf("Getting all projects from \"%s\" collection...", projectCollName)

	cursor, err := m.collection.Find(ctx, bson.M{})
	if err != nil {
		return []entity.Project{}, err
	}

	projects := make([]entity.Project, cursor.RemainingBatchLength())
	index := 0

	for cursor.Next(ctx) {
		dto := projectDTO{}

		err := cursor.Decode(&dto)
		if err != nil {
			return []entity.Project{}, err
		}

		projects[index] = m.dtoToEntity(dto)
		index++
	}

	return projects, nil
}

func (m *projectMongoDBRepo) entityToDTO(p entity.Project) (projectDTO, error) {
	dto := projectDTO{
		Name:         p.Name,
		Description:  p.Description,
		CreationDate: p.CreationDate,
	}

	if p.ID != "" {
		idFromHex, err := primitive.ObjectIDFromHex(p.ID)
		if err != nil {
			return dto, err
		}

		dto.ID = idFromHex
	}

	return dto, nil
}

func (m *projectMongoDBRepo) dtoToEntity(dto projectDTO) entity.Project {
	return entity.Project{
		ID:           dto.ID.Hex(),
		Name:         dto.Name,
		Description:  dto.Description,
		CreationDate: dto.CreationDate,
	}
}
