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
	Favorite           bool
	Archived           bool
	Error              *string
	Repository         Repository
	Members            []Member
	MinioAccessKey     MinioAccessKey
	MlflowStorageSize  string
}

// NewProject is a constructor function.
func NewProject(id, name, description string) Project {
	return Project{ID: id, Name: name, Description: description}
}

func (p Project) HasMember(userID string) bool {
	for _, member := range p.Members {
		if member.UserID == userID {
			return true
		}
	}

	return false
}
