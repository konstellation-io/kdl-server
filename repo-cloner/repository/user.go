package repository

import (
	"context"

	"github.com/go-logr/logr"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/konstellation-io/kdl-server/repo-cloner/config"
)

type User struct {
	Username string             `bson:"username"`
	Email    string             `bson:"email"`
	ID       primitive.ObjectID `bson:"_id"`
}

type UserMongoDBRepo struct {
	collection *mongo.Collection
	logger     logr.Logger
	cfg        config.Config
}

// NewUserMongoDBRepo implements user.Repository interface.
func NewUserMongoDBRepo(cfg config.Config, logger logr.Logger, client *mongo.Client) *UserMongoDBRepo {
	collection := client.Database(cfg.MongoDB.DBName).Collection(cfg.MongoDB.UsersCollName)
	return &UserMongoDBRepo{cfg: cfg, logger: logger, collection: collection}
}

func (u *UserMongoDBRepo) GetUser(userName string) (User, error) {
	user := User{}

	projection := bson.M{
		"_id":      1,
		"username": 1,
		"email":    1,
	}
	findOptions := options.FindOne().SetProjection(projection)
	err := u.collection.FindOne(context.Background(), bson.M{"username": userName}, findOptions).Decode(&user)

	if err != nil {
		return User{}, err
	}

	return user, nil
}
