package entity

import "time"

type ProjectState string

const (
	ProjectStateStarted  ProjectState = "STARTED"
	ProjectStateStopped  ProjectState = "STOPPED"
	ProjectStateArchived ProjectState = "ARCHIVED"
)

func (e ProjectState) IsValid() bool {
	switch e {
	case ProjectStateStarted, ProjectStateStopped, ProjectStateArchived:
		return true
	}

	return false
}

func (e ProjectState) String() string {
	return string(e)
}

type Project struct {
	ID                 string
	Name               string
	Description        string
	CreationDate       time.Time
	LastActivationDate string
	Favorite           bool
	AreToolsActive     bool
	Error              *string
	Repository         *Repository
	Members            []Member
	Tools              []Tool
	State              ProjectState
}

func NewProject(name, description string) Project {
	return Project{Name: name, Description: description}
}
