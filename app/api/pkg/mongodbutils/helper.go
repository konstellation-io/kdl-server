package mongodbutils

import (
	"go.mongodb.org/mongo-driver/mongo"
)

// IsDuplKeyError detects if the error is a E11000 duplicate key error.
func IsDuplKeyError(err error) bool {
	if writeErr, ok := err.(mongo.WriteException); ok {
		if len(writeErr.WriteErrors) > 0 {
			if writeErr.WriteErrors[0].Code == Err11000DupKeyError {
				return true
			}
		}
	}

	return false
}
