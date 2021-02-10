package entity

import (
	"errors"
	"fmt"
)

var (
	// ErrProjectNotFound error definition.
	ErrProjectNotFound = errors.New("project not found")

	// ErrUserNotFound error definition.
	ErrUserNotFound = errors.New("user not found")

	// ErrListUsersEmpty error definition.
	ErrListUsersEmpty = errors.New("user list empty")

	// ErrDuplicatedUser error definition.
	ErrDuplicatedUser = errors.New("user is duplicated")

	// ErrNotImplemented error definition.
	ErrNotImplemented = fmt.Errorf("not implemented")
)
