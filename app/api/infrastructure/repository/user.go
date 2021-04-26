package repository

import (
	"context"
	"errors"
	"time"

	"github.com/konstellation-io/kdl-server/app/api/usecase/user"

	"github.com/konstellation-io/kdl-server/app/api/pkg/mongodb"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const (
	userCollName         = "users"
	ensureIndexesTimeout = 20 * time.Second
)

type userDTO struct {
	ID                 primitive.ObjectID `bson:"_id"`
	Deleted            bool               `bson:"deleted"`
	Username           string             `bson:"username"`
	Email              string             `bson:"email"`
	CreationDate       time.Time          `bson:"creation_date"`
	AccessLevel        string             `bson:"access_level"`
	PublicSSHKey       string             `bson:"public_ssh_key"`
	PrivateSSHKey      string             `bson:"private_ssh_key"`
	SSHKeyCreationDate time.Time          `bson:"ssh_key_creation_date"`
}

type userMongoDBRepo struct {
	logger     logging.Logger
	collection *mongo.Collection
}

// NewUserMongoDBRepo implements user.Repository interface.
func NewUserMongoDBRepo(logger logging.Logger, client *mongo.Client, dbName string) user.Repository {
	collection := client.Database(dbName).Collection(userCollName)
	return &userMongoDBRepo{logger, collection}
}

// EnsureIndexes creates if not exists the indexes for the user collection.
func (m *userMongoDBRepo) EnsureIndexes() error {
	m.logger.Infof("Creating index for \"%s\" collection...", userCollName)

	ctx, cancel := context.WithTimeout(context.Background(), ensureIndexesTimeout)
	defer cancel()

	unique := true
	result, err := m.collection.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{
			Keys: bson.M{"email": 1},
			Options: &options.IndexOptions{
				Unique: &unique,
			},
		},
		{
			Keys: bson.M{"username": 1},
			Options: &options.IndexOptions{
				Unique: &unique,
			},
		},
	})

	m.logger.Infof("Indexes %s created for \"%s\" collection", result, userCollName)

	return err
}

// Get retrieves the user using the identifier.
func (m *userMongoDBRepo) Get(ctx context.Context, id string) (entity.User, error) {
	idFromHex, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return entity.User{}, err
	}

	return m.findOne(ctx, bson.M{"_id": idFromHex})
}

// GetByUsername retrieves the user using their user name.
func (m *userMongoDBRepo) GetByUsername(ctx context.Context, username string) (entity.User, error) {
	return m.findOne(ctx, bson.M{"username": username})
}

// GetByUsername retrieves the user using their user email.
func (m *userMongoDBRepo) GetByEmail(ctx context.Context, email string) (entity.User, error) {
	return m.findOne(ctx, bson.M{"email": email})
}

// FindAll retrieves all the existing users.
func (m *userMongoDBRepo) FindAll(ctx context.Context, includeDeleted bool) ([]entity.User, error) {
	var filter bson.M

	if includeDeleted {
		filter = bson.M{}
	} else {
		filter = bson.M{"deleted": bson.M{"$ne": true}}
	}

	return m.find(ctx, filter)
}

// Create inserts into the database a new entity.
func (m *userMongoDBRepo) Create(ctx context.Context, u entity.User) (string, error) {
	m.logger.Debugf("Inserting a new user \"%s\" into %s collection...", u.Email, userCollName)

	dto, err := m.entityToDTO(u)
	if err != nil {
		return "", err
	}

	dto.ID = primitive.NewObjectID()

	result, err := m.collection.InsertOne(ctx, dto)
	if err != nil {
		if mongodb.IsDuplKeyError(err) {
			return "", entity.ErrDuplicatedUser
		}

		return "", err
	}

	return result.InsertedID.(primitive.ObjectID).Hex(), nil
}

// FindByIDs retrieves the users for the given user identifiers.
func (m *userMongoDBRepo) FindByIDs(ctx context.Context, userIDs []string) ([]entity.User, error) {
	objIDs, err := m.toObjectIDs(userIDs)
	if err != nil {
		return nil, err
	}

	return m.find(ctx, bson.M{"_id": bson.M{"$in": objIDs}})
}

// UpdateAccessLevel update the user access level for the given user identifiers.
func (m *userMongoDBRepo) UpdateAccessLevel(ctx context.Context, userIDs []string, level entity.AccessLevel) error {
	objIDs, err := m.toObjectIDs(userIDs)
	if err != nil {
		return err
	}

	filter := bson.M{
		"_id": bson.M{
			"$in": objIDs,
		},
	}

	upd := bson.M{
		"$set": bson.M{
			"access_level": level,
		},
	}

	_, err = m.collection.UpdateMany(ctx, filter, upd)

	return err
}

func (m *userMongoDBRepo) UpdateSSHKey(ctx context.Context, username string, sshKey entity.SSHKey) error {
	fields := bson.M{
		"public_ssh_key":        sshKey.Public,
		"private_ssh_key":       sshKey.Private,
		"ssh_key_creation_date": sshKey.CreationDate,
	}

	return m.updateUserFields(ctx, username, fields)
}

func (m *userMongoDBRepo) UpdateEmail(ctx context.Context, username, email string) error {
	return m.updateUserFields(ctx, username, bson.M{"email": email})
}

func (m *userMongoDBRepo) UpdateDeleted(ctx context.Context, username string, deleted bool) error {
	return m.updateUserFields(ctx, username, bson.M{"deleted": deleted})
}

func (m *userMongoDBRepo) updateUserFields(ctx context.Context, username string, fields bson.M) error {
	m.logger.Debugf("Updating user \"%s\" with \"%#v\"...", username, fields)

	filter := bson.M{"username": username}

	_, err := m.collection.UpdateOne(ctx, filter, bson.M{
		"$set": fields,
	})

	return err
}

func (m *userMongoDBRepo) toObjectIDs(userIDs []string) ([]primitive.ObjectID, error) {
	objIDs := make([]primitive.ObjectID, len(userIDs))

	for i, id := range userIDs {
		objID, err := primitive.ObjectIDFromHex(id)
		if err != nil {
			return nil, err
		}

		objIDs[i] = objID
	}

	return objIDs, nil
}

func (m *userMongoDBRepo) findOne(ctx context.Context, filters bson.M) (entity.User, error) {
	m.logger.Debugf("Finding one user by \"%#v\" from database...", filters)

	dto := userDTO{}

	err := m.collection.FindOne(ctx, filters).Decode(&dto)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return entity.User{}, entity.ErrUserNotFound
	}

	return m.dtoToEntity(dto), err
}

func (m *userMongoDBRepo) find(ctx context.Context, filters bson.M) ([]entity.User, error) {
	m.logger.Debugf("Finding users with filters \"%#v\"...", filters)

	var dtos []userDTO

	err := mongodb.Find(ctx, filters, m.collection, &dtos)
	if err != nil {
		return nil, err
	}

	return m.dtosToEntities(dtos), nil
}

func (m *userMongoDBRepo) entityToDTO(u entity.User) (userDTO, error) {
	dto := userDTO{
		Username:           u.Username,
		Email:              u.Email,
		AccessLevel:        string(u.AccessLevel),
		PrivateSSHKey:      u.SSHKey.Private,
		PublicSSHKey:       u.SSHKey.Public,
		SSHKeyCreationDate: u.SSHKey.CreationDate,
		CreationDate:       u.CreationDate,
		Deleted:            u.Deleted,
	}

	if u.ID != "" {
		idFromHex, err := primitive.ObjectIDFromHex(u.ID)
		if err != nil {
			return dto, err
		}

		dto.ID = idFromHex
	}

	return dto, nil
}

func (m *userMongoDBRepo) dtoToEntity(dto userDTO) entity.User {
	return entity.User{
		ID:           dto.ID.Hex(),
		Username:     dto.Username,
		Email:        dto.Email,
		AccessLevel:  entity.AccessLevel(dto.AccessLevel),
		CreationDate: dto.CreationDate,
		SSHKey: entity.SSHKey{
			Public:       dto.PublicSSHKey,
			Private:      dto.PrivateSSHKey,
			CreationDate: dto.SSHKeyCreationDate,
		},
		Deleted: dto.Deleted,
	}
}

func (m *userMongoDBRepo) dtosToEntities(dtos []userDTO) []entity.User {
	result := make([]entity.User, len(dtos))

	for i, dto := range dtos {
		result[i] = m.dtoToEntity(dto)
	}

	return result
}
