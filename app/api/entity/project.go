package entity

import (
	"time"
)

// Project entity definition.
type Project struct {
	ID                 string
	Name               string
	Description        string
	CreationDate       time.Time
	LastActivationDate string
	Error              *string
	Repository         Repository
	Members            []Member
	Favorite           bool
	Archived           bool
}

// NewProject is a constructor function.
func NewProject(name, description string) Project {
	return Project{Name: name, Description: description, Archived: false}
}
