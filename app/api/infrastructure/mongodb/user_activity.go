package mongodb

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/mongo"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
	"github.com/konstellation-io/kdl-server/app/api/usecase/project"
)

const (
	userActivityCollName = "userActivity"
)

type userActivityDTO struct {
	Date   time.Time            `bson:"date"`
	UserID string               `bson:"userId"`
	Type   string               `bson:"type"`
	Vars   []userActivityVarDTO `bson:"vars"`
}

type userActivityVarDTO struct {
	Key   string `bson:"key"`
	Value string `bson:"value"`
}

type UserActivityRepo struct {
	logger     logging.Logger
	collection *mongo.Collection
}

// UserActivityRepo implements the project.UserActivityRepo interface.
var _ project.UserActivityRepo = (*UserActivityRepo)(nil)

func NewUserActivityRepo(logger logging.Logger, client *mongo.Client, dbName string) *UserActivityRepo {
	collection := client.Database(dbName).Collection(userActivityCollName)

	return &UserActivityRepo{
		logger,
		collection,
	}
}

func (r *UserActivityRepo) Create(ctx context.Context, activity entity.UserActivity) error {
	ctx, cancel := context.WithTimeout(ctx, 60*time.Second)
	defer cancel()

	dto := r.entityToDTO(activity)

	_, err := r.collection.InsertOne(ctx, dto)
	if err != nil {
		return err
	}

	return nil
}

func (r *UserActivityRepo) entityToDTO(activity entity.UserActivity) userActivityDTO {
	dto := userActivityDTO{
		Date:   activity.Date,
		UserID: activity.UserID,
		Type:   activity.Type.String(),
	}

	for _, v := range activity.Vars {
		dto.Vars = append(dto.Vars, userActivityVarDTO{
			Key:   v.Key,
			Value: v.Value,
		})
	}

	return dto
}
