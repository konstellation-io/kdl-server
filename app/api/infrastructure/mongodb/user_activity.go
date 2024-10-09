package mongodb

import (
	"context"
	"time"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/config"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"

	"go.mongodb.org/mongo-driver/mongo"
)

type UserActivityRepoMongoDB struct {
	cfg        *config.Config
	logger     logging.Logger
	collection *mongo.Collection
}

func NewUserActivityRepoMongoDB(cfg *config.Config, logger logging.Logger, client *mongo.Client) *UserActivityRepoMongoDB {
	collection := client.Database(cfg.MongoDB.DBName).Collection("userActivity")

	return &UserActivityRepoMongoDB{
		cfg,
		logger,
		collection,
	}
}

func (r *UserActivityRepoMongoDB) Create(activity entity.UserActivity) error {
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	activity.Date = time.Now()

	_, err := r.collection.InsertOne(ctx, activity)
	if err != nil {
		return err
	}

	return nil
}
