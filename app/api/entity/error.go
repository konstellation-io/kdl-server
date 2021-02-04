package entity

import (
	"errors"
	"fmt"
)

var (
	ErrProjectNotFound = errors.New("project not found")
	ErrNotImplemented  = fmt.Errorf("not implemented")
)
