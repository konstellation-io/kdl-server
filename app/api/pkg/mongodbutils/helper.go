package mongodbutils

import (
	"errors"

	"go.mongodb.org/mongo-driver/mongo"
)

// IsDuplKeyError detects if the error is a E11000 duplicate key error.
func IsDuplKeyError(err error) bool {
	var writeErr mongo.WriteException
	if errors.As(err, &writeErr) {
		for _, we := range writeErr.WriteErrors {
			if we.Code == Err11000DupKeyError {
				return true
			}
		}
	}

	return false
}
