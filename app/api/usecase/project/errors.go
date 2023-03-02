package project

import "errors"

var (
	ErrWrongAccessLevel = errors.New("only admin users can delete projects")
	ErrRepoNotFound     = errors.New("repo not found")
)
