package mongodb

import (
	"errors"
	"fmt"
)

var (
	ErrWrongNumberProjectsDeleted  = errors.New("number of projects deleted is not 1")
	ErrCastingInsertedIDToObjectID = errors.New("error casting InsertedID to primitive.ObjectID")
	ErrCastingInsertedIDToString   = errors.New("error casting InsertedID to string")
)

func NewErrWrongNumberProjectsDeleted(count int) error {
	return fmt.Errorf("%w, instead was: %d", ErrWrongNumberProjectsDeleted, count)
}
