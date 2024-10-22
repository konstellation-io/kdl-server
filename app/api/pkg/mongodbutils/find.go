package mongodbutils

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// Find executes the query in MongoDB and decode all results in dtos slice.
// Example:
// var dtos []userDTO
// err := mongodb.Find(ctx, props, m.collection, &dtos).
func Find(ctx context.Context, filter bson.M, collection *mongo.Collection, dtos interface{}) error {
	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		return err
	}

	err = cursor.All(ctx, dtos)
	if err != nil {
		return err
	}

	return nil
}
