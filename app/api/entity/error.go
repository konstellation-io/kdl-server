package entity

import (
	"errors"
	"fmt"
)

var (
	ErrProjectNotFound = errors.New("project not found")
	ErrUserNotFound    = errors.New("user not found")
	ErrDuplicatedUser  = errors.New("user is duplicated")
	ErrNotImplemented  = fmt.Errorf("not implemented")
)
