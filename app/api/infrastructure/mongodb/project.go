package mongodb

import (
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
	"github.com/konstellation-io/kdl-server/app/api/pkg/mongodbutils"
	"github.com/konstellation-io/kdl-server/app/api/usecase/project"
)

const projectCollName = "projects"

type memberDTO struct {
	UserID      primitive.ObjectID `bson:"user_id"`
	AccessLevel entity.AccessLevel `bson:"access_level"`
	AddedDate   time.Time          `bson:"added_date"`
}

type projectDTO struct {
	ID                 string                      `bson:"_id"`
	Archived           bool                        `bson:"archived"`
	Name               string                      `bson:"name"`
	Description        string                      `bson:"description"`
	CreationDate       time.Time                   `bson:"creation_date"`
	LastActivationDate string                      `bson:"last_activation_date"`
	RepositoryType     entity.RepositoryType       `bson:"repo_type"`
	RepoName           string                      `bson:"repo_name"`
	AuthMethod         entity.RepositoryAuthMethod `bson:"auth_method"`
	ExternalRepoURL    string                      `bson:"external_repo_url"`
	Members            []memberDTO                 `bson:"members"`
}

type ProjectRepo struct {
	logger     logging.Logger
	collection *mongo.Collection
}

// projectRepo implements the capabilities.Repository interface.
var _ project.Repository = (*ProjectRepo)(nil)

func NewProjectRepo(logger logging.Logger, client *mongo.Client, dbName string) *ProjectRepo {
	collection := client.Database(dbName).Collection(projectCollName)
	return &ProjectRepo{logger, collection}
}

// Create inserts into the database a new project entity.
func (m *ProjectRepo) Create(ctx context.Context, p entity.Project) (string, error) {
	m.logger.Debugf("Creating new project %q...", p.ID)

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

// Get retrieves a project using the identifier.
func (m *ProjectRepo) Get(ctx context.Context, id string) (entity.Project, error) {
	return m.findOne(ctx, bson.M{"_id": id})
}

// FindAll retrieves all projects in the database.
func (m *ProjectRepo) FindAll(ctx context.Context) ([]entity.Project, error) {
	return m.find(ctx, bson.M{})
}

// AddMembers creates a new user in the member list for the given project.
func (m *ProjectRepo) AddMembers(ctx context.Context, projectID string, members []entity.Member) error {
	m.logger.Debugf("Adding %d new members to project %q...", len(members), projectID)

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

// RemoveMembers deletes users from the member list for the given project.
func (m *ProjectRepo) RemoveMembers(ctx context.Context, projectID string, users []entity.User) error {
	m.logger.Debugf("Removing members from project %q...", projectID)

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

// UpdateMembersAccessLevel updates the access level for a given project to all given users.
func (m *ProjectRepo) UpdateMembersAccessLevel(
	ctx context.Context, projectID string, users []entity.User, accessLevel entity.AccessLevel) error {
	m.logger.Debugf("Updating members access level to %q from project %q...", accessLevel, projectID)

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
func (m *ProjectRepo) UpdateName(ctx context.Context, projectID, name string) error {
	return m.updateProjectFields(ctx, projectID, bson.M{"name": name})
}

// UpdateDescription changes the description for the given project.
func (m *ProjectRepo) UpdateDescription(ctx context.Context, projectID, description string) error {
	return m.updateProjectFields(ctx, projectID, bson.M{"description": description})
}

// UpdateArchived changes the archived field for the given project.
func (m *ProjectRepo) UpdateArchived(ctx context.Context, projectID string, archived bool) error {
	return m.updateProjectFields(ctx, projectID, bson.M{"archived": archived})
}

func (m *ProjectRepo) DeleteOne(ctx context.Context, projectID string) error {
	filter := bson.M{
		"_id": projectID,
	}

	res, err := m.collection.DeleteOne(ctx, filter)
	if err != nil {
		m.logger.Errorf("Could not delete project \"\" from MongoDB", projectID)
	}

	if res.DeletedCount != 1 {
		m.logger.Errorf("Could not delete project \"\" from MongoDB", projectID)
		return NewErrWrongNumberProjectsDeleted(int(res.DeletedCount))
	}

	m.logger.Infof("Deleted project %q from MongoDB ", projectID)

	return nil
}

func (m *ProjectRepo) updateProjectFields(ctx context.Context, projectID string, fields bson.M) error {
	m.logger.Debugf("Updating the project %q with %q...", projectID, fields)

	filter := bson.M{"_id": projectID}

	_, err := m.collection.UpdateOne(ctx, filter, bson.M{
		"$set": fields,
	})

	return err
}

func (m *ProjectRepo) findOne(ctx context.Context, filters bson.M) (entity.Project, error) {
	m.logger.Debugf("Finding one project by %q from database...", filters)

	dto := projectDTO{}

	err := m.collection.FindOne(ctx, filters).Decode(&dto)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return entity.Project{}, entity.ErrProjectNotFound
	}

	return m.dtoToEntity(dto), err
}

func (m *ProjectRepo) find(ctx context.Context, filters bson.M) ([]entity.Project, error) {
	m.logger.Debugf("Finding projects with filters %q...", filters)

	var dtos []projectDTO

	err := mongodbutils.Find(ctx, filters, m.collection, &dtos)
	if err != nil {
		return nil, err
	}

	return m.dtosToEntities(dtos), nil
}

func (m *ProjectRepo) entityToDTO(p entity.Project) (projectDTO, error) {
	dto := projectDTO{
		ID:                 p.ID,
		Name:               p.Name,
		Description:        p.Description,
		CreationDate:       p.CreationDate,
		LastActivationDate: p.LastActivationDate,
		RepositoryType:     p.Repository.Type,
		RepoName:           p.Repository.RepoName,
		AuthMethod:         p.Repository.AuthMethod,
		ExternalRepoURL:    p.Repository.ExternalRepoURL,
		Archived:           p.Archived,
	}

	memberDTOS, err := m.membersToDTOs(p.Members)
	if err != nil {
		return projectDTO{}, err
	}

	dto.Members = memberDTOS

	return dto, nil
}

func (m *ProjectRepo) membersToDTOs(members []entity.Member) ([]memberDTO, error) {
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

func (m *ProjectRepo) dtoToEntity(dto projectDTO) entity.Project {
	p := entity.Project{
		ID:                 dto.ID,
		Name:               dto.Name,
		Description:        dto.Description,
		CreationDate:       dto.CreationDate,
		LastActivationDate: dto.LastActivationDate,
		Repository: entity.Repository{
			AuthMethod:      dto.AuthMethod,
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

func (m *ProjectRepo) dtosToEntities(dtos []projectDTO) []entity.Project {
	result := make([]entity.Project, len(dtos))

	for i, dto := range dtos {
		result[i] = m.dtoToEntity(dto)
	}

	return result
}

func (m *ProjectRepo) toObjectIDs(users []entity.User) ([]primitive.ObjectID, error) {
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