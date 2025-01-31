package mongodb

import (
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/go-logr/logr"
	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/pkg/mongodbutils"
	"github.com/konstellation-io/kdl-server/app/api/usecase/user"
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
	Sub                string             `bson:"sub"`
	CreationDate       time.Time          `bson:"creation_date"`
	LastActivity       time.Time          `bson:"last_activity"`
	AccessLevel        string             `bson:"access_level"`
	PublicSSHKey       string             `bson:"public_ssh_key"`
	PrivateSSHKey      string             `bson:"private_ssh_key"`
	SSHKeyCreationDate time.Time          `bson:"ssh_key_creation_date"`
}

type UserRepo struct {
	logger     logr.Logger
	collection *mongo.Collection
}

// UserRepo implements the user.Repository interface.
var _ user.Repository = (*UserRepo)(nil)

func NewUserRepo(logger logr.Logger, mongo *mongodbutils.MongoDB, dbName string) *UserRepo {
	collection := mongo.CreateCollection(dbName, userCollName)
	return &UserRepo{logger, collection}
}

// EnsureIndexes creates if not exists the indexes for the user collection.
func (m *UserRepo) EnsureIndexes() error {
	m.logger.Info("Creating indexes for collection", "collection", userCollName)

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
		{
			Keys: bson.M{"sub": 1},
			Options: &options.IndexOptions{
				Unique: &unique,
			},
		},
	})

	m.logger.Info("Indexes created for collection", "result", result, "collection", userCollName)

	return err
}

// Get retrieves the user using the identifier.
func (m *UserRepo) Get(ctx context.Context, id string) (entity.User, error) {
	idFromHex, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return entity.User{}, err
	}

	return m.findOne(ctx, bson.M{"_id": idFromHex})
}

// GetByUsername retrieves the user using their user name.
func (m *UserRepo) GetByUsername(ctx context.Context, username string) (entity.User, error) {
	return m.findOne(ctx, bson.M{"username": username})
}

// GetByEmail retrieves the user using their user email.
func (m *UserRepo) GetByEmail(ctx context.Context, email string) (entity.User, error) {
	return m.findOne(ctx, bson.M{"email": email})
}

// GetBySub retrieves the user using their user sub.
func (m *UserRepo) GetBySub(ctx context.Context, sub string) (entity.User, error) {
	return m.findOne(ctx, bson.M{"sub": sub})
}

// FindAll retrieves all the existing users.
func (m *UserRepo) FindAll(ctx context.Context, includeDeleted bool) ([]entity.User, error) {
	var filter bson.M

	if includeDeleted {
		filter = bson.M{}
	} else {
		filter = bson.M{"deleted": bson.M{"$ne": true}}
	}

	return m.find(ctx, filter)
}

// Create inserts into the database a new entity.
func (m *UserRepo) Create(ctx context.Context, u entity.User) (string, error) {
	m.logger.Info("Creating new user in database", "userEmail", u.Email, "collection", userCollName)

	dto, err := m.entityToDTO(u)
	if err != nil {
		return "", err
	}

	if dto.ID.IsZero() {
		dto.ID = primitive.NewObjectID()
	}

	result, err := m.collection.InsertOne(ctx, dto)
	if err != nil {
		if mongodbutils.IsDuplKeyError(err) {
			return "", entity.ErrDuplicatedUser
		}

		return "", err
	}

	insertedID, ok := result.InsertedID.(primitive.ObjectID)
	if !ok {
		return "", ErrCastingInsertedIDToObjectID
	}

	return insertedID.Hex(), nil
}

// FindByIDs retrieves the users for the given user identifiers.
func (m *UserRepo) FindByIDs(ctx context.Context, userIDs []string) ([]entity.User, error) {
	objIDs, err := m.toObjectIDs(userIDs)
	if err != nil {
		return nil, err
	}

	return m.find(ctx, bson.M{"_id": bson.M{"$in": objIDs}})
}

// UpdateAccessLevel update the user access level for the given user identifiers.
func (m *UserRepo) UpdateAccessLevel(ctx context.Context, userIDs []string, level entity.AccessLevel) error {
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

func (m *UserRepo) UpdateSSHKey(ctx context.Context, username string, sshKey entity.SSHKey) error {
	fields := bson.M{
		"public_ssh_key":        sshKey.Public,
		"private_ssh_key":       sshKey.Private,
		"ssh_key_creation_date": sshKey.CreationDate,
	}

	return m.updateUserFields(ctx, username, fields)
}

func (m *UserRepo) UpdateEmail(ctx context.Context, username, email string) error {
	return m.updateUserFields(ctx, username, bson.M{"email": email})
}

func (m *UserRepo) UpdateSub(ctx context.Context, username, sub string) error {
	return m.updateUserFields(ctx, username, bson.M{"sub": sub})
}

func (m *UserRepo) UpdateUsername(ctx context.Context, email, username string) error {
	m.logger.Info("Updating username", "newUsername", username, "userEmail", email)

	filter := bson.M{"email": email}

	fields := bson.M{"username": username, "deleted": false}

	_, err := m.collection.UpdateOne(ctx, filter, bson.M{
		"$set": fields,
	})

	return err
}

func (m *UserRepo) UpdateDeleted(ctx context.Context, username string, deleted bool) error {
	return m.updateUserFields(ctx, username, bson.M{"deleted": deleted})
}

func (m *UserRepo) UpdateLastActivity(ctx context.Context, username string, lastActivity time.Time) error {
	return m.updateUserFields(ctx, username, bson.M{"last_activity": lastActivity})
}

func (m *UserRepo) updateUserFields(ctx context.Context, username string, fields bson.M) error {
	m.logger.Info("Updating user", "username", username, "fields", fields)

	filter := bson.M{"username": username}

	_, err := m.collection.UpdateOne(ctx, filter, bson.M{
		"$set": fields,
	})

	return err
}

func (m *UserRepo) toObjectIDs(userIDs []string) ([]primitive.ObjectID, error) {
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

func (m *UserRepo) findOne(ctx context.Context, filters bson.M) (entity.User, error) {
	m.logger.Info("Fetching one user from database", "filters", filters)

	dto := userDTO{}

	err := m.collection.FindOne(ctx, filters).Decode(&dto)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return entity.User{}, entity.ErrUserNotFound
	}
	// review this error handling: if err!=nil {entity.User{}. return err}

	return m.dtoToEntity(dto), err
}

func (m *UserRepo) find(ctx context.Context, filters bson.M) ([]entity.User, error) {
	m.logger.Info("Fetching users", "filters", filters)

	var dtos []userDTO

	err := mongodbutils.Find(ctx, filters, m.collection, &dtos)
	if err != nil {
		return nil, err
	}

	return m.dtosToEntities(dtos), nil
}

func (m *UserRepo) entityToDTO(u entity.User) (userDTO, error) {
	dto := userDTO{
		Username:           u.Username,
		Email:              u.Email,
		Sub:                u.Sub,
		AccessLevel:        string(u.AccessLevel),
		PrivateSSHKey:      u.SSHKey.Private,
		PublicSSHKey:       u.SSHKey.Public,
		SSHKeyCreationDate: u.SSHKey.CreationDate,
		CreationDate:       u.CreationDate,
		LastActivity:       u.LastActivity,
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

func (m *UserRepo) dtoToEntity(dto userDTO) entity.User {
	return entity.User{
		ID:           dto.ID.Hex(),
		Username:     dto.Username,
		Email:        dto.Email,
		Sub:          dto.Sub,
		AccessLevel:  entity.AccessLevel(dto.AccessLevel),
		CreationDate: dto.CreationDate,
		LastActivity: dto.LastActivity,
		SSHKey: entity.SSHKey{
			Public:       dto.PublicSSHKey,
			Private:      dto.PrivateSSHKey,
			CreationDate: dto.SSHKeyCreationDate,
		},
		Deleted: dto.Deleted,
	}
}

func (m *UserRepo) dtosToEntities(dtos []userDTO) []entity.User {
	result := make([]entity.User, len(dtos))

	for i, dto := range dtos {
		result[i] = m.dtoToEntity(dto)
	}

	return result
}
