package mongodb

import (
	"errors"
	"fmt"
)

var (
	ErrWrongNumberProjectsDeleted = errors.New("number of projects deleted is not 1")
)

func NewErrWrongNumberProjectsDeleted(count int) error {
	return fmt.Errorf("%w, instead was: %d", ErrWrongNumberProjectsDeleted, count)
}
