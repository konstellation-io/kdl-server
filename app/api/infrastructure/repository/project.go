package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/mongo/options"

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
	ID              string                `bson:"_id"`
	Archived        bool                  `bson:"archived"`
	Name            string                `bson:"name"`
	Description     string                `bson:"description"`
	CreationDate    time.Time             `bson:"creation_date"`
	RepositoryType  entity.RepositoryType `bson:"repo_type"`
	RepoName        string                `bson:"repo_name"`
	ExternalRepoURL string                `bson:"external_repo_url"`
	Members         []memberDTO           `bson:"members"`
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
	return m.findOne(ctx, bson.M{"_id": id})
}

// Create inserts into the database a new entity.
func (m *projectMongoDBRepo) Create(ctx context.Context, p entity.Project) (string, error) {
	m.logger.Debugf("Creating new project \"%s\"...", p.ID)

	dto, err := m.entityToDTO(p)
	if err != nil {
		return "", err
	}

	result, err := m.collection.InsertOne(ctx, dto)
	if err != nil {
		return "", err
	}

	return result.InsertedID.(string), nil
}

// FindAll retrieves all projects.
func (m *projectMongoDBRepo) FindAll(ctx context.Context) ([]entity.Project, error) {
	return m.find(ctx, bson.M{})
}

// AddMembers creates a new user in the member list for the given project.
func (m *projectMongoDBRepo) AddMembers(ctx context.Context, projectID string, members []entity.Member) error {
	m.logger.Debugf("Adding %d new members to project \"%s\"...", len(members), projectID)

	filter := bson.M{"_id": projectID}

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

// RemoveMembers delete users from the member list for the given project.
func (m *projectMongoDBRepo) RemoveMembers(ctx context.Context, projectID string, users []entity.User) error {
	m.logger.Debugf("Removing members from project \"%s\"...", projectID)

	uObjIDs, err := m.toObjectIDs(users)
	if err != nil {
		return err
	}

	filter := bson.M{"_id": projectID}

	upd := bson.M{
		"$pull": bson.M{
			"members": bson.M{
				"user_id": bson.M{
					"$in": uObjIDs,
				},
			},
		},
	}

	_, err = m.collection.UpdateOne(ctx, filter, upd)

	return err
}

// UpdateMembersAccessLevel delete users from the member list for the given project.
func (m *projectMongoDBRepo) UpdateMembersAccessLevel(
	ctx context.Context, projectID string, users []entity.User, accessLevel entity.AccessLevel) error {
	m.logger.Debugf("Updating members access level to \"%s\" from project \"%s\"...", accessLevel, projectID)

	uObjIDs, err := m.toObjectIDs(users)
	if err != nil {
		return err
	}

	filter := bson.M{
		"_id": projectID,
	}

	upd := bson.M{
		"$set": bson.M{
			"members.$[member].access_level": accessLevel,
		},
	}

	opts := options.Update().SetArrayFilters(options.ArrayFilters{
		Filters: []interface{}{bson.M{"member.user_id": bson.M{"$in": uObjIDs}}},
	})

	_, err = m.collection.UpdateOne(ctx, filter, upd, opts)

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

// UpdateArchived changes the archived field for the given project.
func (m *projectMongoDBRepo) UpdateArchived(ctx context.Context, projectID string, archived bool) error {
	return m.updateProjectFields(ctx, projectID, bson.M{"archived": archived})
}

func (m *projectMongoDBRepo) DeleteOne(ctx context.Context, projectID string) error {
	filter := bson.M{
		"_id": projectID,
	}

	res, err := m.collection.DeleteOne(ctx, filter)
	if err != nil {
		m.logger.Errorf("Could not delete project \"\" from MongoDB", projectID)
	}

	if res.DeletedCount != 1 {
		m.logger.Errorf("Could not delete project \"\" from MongoDB", projectID)
		return fmt.Errorf("number of projects deleted is not 1: %d", res.DeletedCount)
	}

	m.logger.Infof("Deleted project \"%s\" from MongoDB ", projectID)

	return nil
}

func (m *projectMongoDBRepo) updateProjectFields(ctx context.Context, projectID string, fields bson.M) error {
	m.logger.Debugf("Updating the project \"%s\" with \"%s\"...", projectID, fields)

	filter := bson.M{"_id": projectID}

	_, err := m.collection.UpdateOne(ctx, filter, bson.M{
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
		ID:              p.ID,
		Name:            p.Name,
		Description:     p.Description,
		CreationDate:    p.CreationDate,
		RepositoryType:  p.Repository.Type,
		RepoName:        p.Repository.RepoName,
		ExternalRepoURL: p.Repository.ExternalRepoURL,
		Archived:        p.Archived,
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
		ID:           dto.ID,
		Name:         dto.Name,
		Description:  dto.Description,
		CreationDate: dto.CreationDate,
		Repository: entity.Repository{
			Type:            dto.RepositoryType,
			ExternalRepoURL: dto.ExternalRepoURL,
			RepoName:        dto.RepoName,
		},
		Archived: dto.Archived,
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

func (m *projectMongoDBRepo) toObjectIDs(users []entity.User) ([]primitive.ObjectID, error) {
	objIDs := make([]primitive.ObjectID, len(users))

	for i, user := range users {
		idFromHex, err := primitive.ObjectIDFromHex(user.ID)
		if err != nil {
			return nil, err
		}

		objIDs[i] = idFromHex
	}

	return objIDs, nil
}
