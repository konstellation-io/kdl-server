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

	// ErrRuntimeNotFound error definition.
	ErrRuntimeNotFound = fmt.Errorf("runtime not found")

	// ErrNoRunningRuntime error definition.
	ErrNoRunningRuntime = fmt.Errorf("no running runtime")

	// ErrCapabilitiesNotFound error definition.
	ErrCapabilitiesNotFound = errors.New("capabilities not found")
)
