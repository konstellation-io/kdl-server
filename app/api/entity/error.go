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

	// ErrDuplicatedUser error definition.
	ErrDuplicatedUser = errors.New("user is duplicated")

	// ErrNotImplemented error definition.
	ErrNotImplemented = fmt.Errorf("not implemented")

	// ErrInvalidRepoType error definition.
	ErrInvalidRepoType = fmt.Errorf("invalid repo type")

	// RuntimeNotFound error definition.
	RuntimeNotFound = fmt.Errorf("runtime not found")

	// NoRunningRuntime error definition.
	NoRunningRuntime = fmt.Errorf("no running runtime")
)
