package repository

import (
	"context"
	"errors"
	"time"

	"github.com/konstellation-io/kdl-server/app/api/pkg/mongodb"

	"github.com/konstellation-io/kdl-server/app/api/usecase/project"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

const projectCollName = "projects"

type memberDTO struct {
	UserID      primitive.ObjectID `bson:"user_id"`
	AccessLevel entity.AccessLevel `bson:"access_level"`
	AddedDate   time.Time          `bson:"added_date"`
}

type projectDTO struct {
	ID               primitive.ObjectID    `bson:"_id"`
	Name             string                `bson:"name"`
	Description      string                `bson:"description"`
	CreationDate     time.Time             `bson:"creation_date"`
	RepositoryType   entity.RepositoryType `bson:"repo_type"`
	InternalRepoName string                `bson:"internal_repo_name"`
	ExternalRepoURL  string                `bson:"external_repo_url"`
	Members          []memberDTO           `bson:"members"`
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
	idFromHex, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return entity.Project{}, err
	}

	return m.findOne(ctx, bson.M{"_id": idFromHex})
}

// Create inserts into the database a new entity.
func (m *projectMongoDBRepo) Create(ctx context.Context, p entity.Project) (string, error) {
	m.logger.Debugf("Creating new project \"%s\"...", p.Name)

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

// FindByUserID retrieves the projects of the given user.
func (m *projectMongoDBRepo) FindByUserID(ctx context.Context, userID string) ([]entity.Project, error) {
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, err
	}

	return m.find(ctx, bson.M{"members.user_id": objID})
}

// AddMembers creates a new user in the member list for the given project.
func (m *projectMongoDBRepo) AddMembers(ctx context.Context, projectID string, members []entity.Member) error {
	m.logger.Debugf("Adding %d new members to project \"%s\"...", len(members), projectID)

	pID, err := primitive.ObjectIDFromHex(projectID)
	if err != nil {
		return err
	}

	filter := bson.M{"_id": pID}

	memberDTOS, err := m.membersToDTOs(members)
	if err != nil {
		return err
	}

	upd := bson.M{
		"$push": bson.M{
			"members": bson.M{
				"$each": memberDTOS,
			},
		},
	}

	_, err = m.collection.UpdateOne(ctx, filter, upd)

	return err
}

// RemoveMember deletes a user from the member list for the given project.
func (m *projectMongoDBRepo) RemoveMember(ctx context.Context, projectID, userID string) error {
	m.logger.Debugf("Removing member \"%s\" from project \"%s\"...", userID, projectID)

	pObjID, err := primitive.ObjectIDFromHex(projectID)
	if err != nil {
		return err
	}

	uObjID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return err
	}

	filter := bson.M{"_id": pObjID}

	upd := bson.M{
		"$pull": bson.M{
			"members": bson.M{
				"user_id": uObjID,
			},
		},
	}

	_, err = m.collection.UpdateOne(ctx, filter, upd)

	return err
}

func (m *projectMongoDBRepo) UpdateMemberAccessLevel(ctx context.Context, projectID, userID string, accessLevel entity.AccessLevel) error {
	m.logger.Debugf("Updating member \"%s\" access level to \"%s\" from project \"%s\"...", userID, accessLevel, projectID)

	pObjID, err := primitive.ObjectIDFromHex(projectID)
	if err != nil {
		return err
	}

	uObjID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return err
	}

	filter := bson.M{"_id": pObjID, "members.user_id": uObjID}

	upd := bson.M{
		"$set": bson.M{
			"members.$.access_level": accessLevel,
		},
	}

	_, err = m.collection.UpdateOne(ctx, filter, upd)

	return err
}

// UpdateName changes the name for the given project.
func (m *projectMongoDBRepo) UpdateName(ctx context.Context, projectID, name string) error {
	return m.updateProjectFields(ctx, projectID, bson.M{"name": name})
}

// UpdateDescription changes the description for the given project.
func (m *projectMongoDBRepo) UpdateDescription(ctx context.Context, projectID, description string) error {
	return m.updateProjectFields(ctx, projectID, bson.M{"description": description})
}

func (m *projectMongoDBRepo) updateProjectFields(ctx context.Context, projectID string, fields bson.M) error {
	m.logger.Debugf("Updating the project \"%s\" with \"%s\"...", projectID, fields)

	pObjID, err := primitive.ObjectIDFromHex(projectID)
	if err != nil {
		return err
	}

	filter := bson.M{"_id": pObjID}

	_, err = m.collection.UpdateOne(ctx, filter, bson.M{
		"$set": fields,
	})

	return err
}

func (m *projectMongoDBRepo) findOne(ctx context.Context, filters bson.M) (entity.Project, error) {
	m.logger.Debugf("Finding one project by \"%s\" from database...", filters)

	dto := projectDTO{}

	err := m.collection.FindOne(ctx, filters).Decode(&dto)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return entity.Project{}, entity.ErrProjectNotFound
	}

	return m.dtoToEntity(dto), err
}

func (m *projectMongoDBRepo) find(ctx context.Context, filters bson.M) ([]entity.Project, error) {
	m.logger.Debugf("Finding projects with filters \"%s\"...", filters)

	var dtos []projectDTO

	err := mongodb.Find(ctx, filters, m.collection, &dtos)
	if err != nil {
		return nil, err
	}

	return m.dtosToEntities(dtos), nil
}

func (m *projectMongoDBRepo) entityToDTO(p entity.Project) (projectDTO, error) {
	dto := projectDTO{
		Name:             p.Name,
		Description:      p.Description,
		CreationDate:     p.CreationDate,
		RepositoryType:   p.Repository.Type,
		InternalRepoName: p.Repository.InternalRepoName,
		ExternalRepoURL:  p.Repository.ExternalRepoURL,
	}

	if p.ID != "" {
		idFromHex, err := primitive.ObjectIDFromHex(p.ID)
		if err != nil {
			return projectDTO{}, err
		}

		dto.ID = idFromHex
	}

	memberDTOS, err := m.membersToDTOs(p.Members)
	if err != nil {
		return projectDTO{}, err
	}

	dto.Members = memberDTOS

	return dto, nil
}

func (m *projectMongoDBRepo) membersToDTOs(members []entity.Member) ([]memberDTO, error) {
	dtos := make([]memberDTO, len(members))

	for i, m := range members {
		idFromHex, err := primitive.ObjectIDFromHex(m.UserID)
		if err != nil {
			return nil, err
		}

		dtos[i] = memberDTO{
			UserID:      idFromHex,
			AccessLevel: m.AccessLevel,
			AddedDate:   m.AddedDate,
		}
	}

	return dtos, nil
}

func (m *projectMongoDBRepo) dtoToEntity(dto projectDTO) entity.Project {
	p := entity.Project{
		ID:           dto.ID.Hex(),
		Name:         dto.Name,
		Description:  dto.Description,
		CreationDate: dto.CreationDate,
		Repository: entity.Repository{
			Type:             dto.RepositoryType,
			ExternalRepoURL:  dto.ExternalRepoURL,
			InternalRepoName: dto.InternalRepoName,
		},
	}

	p.Members = make([]entity.Member, len(dto.Members))

	for i, m := range dto.Members {
		p.Members[i] = entity.Member{
			UserID:      m.UserID.Hex(),
			AccessLevel: m.AccessLevel,
			AddedDate:   m.AddedDate,
		}
	}

	return p
}

func (m *projectMongoDBRepo) dtosToEntities(dtos []projectDTO) []entity.Project {
	result := make([]entity.Project, len(dtos))

	for i, dto := range dtos {
		result[i] = m.dtoToEntity(dto)
	}

	return result
}
