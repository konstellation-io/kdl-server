package entity

import "time"

// ProjectState is an enum for project state.
type ProjectState string

const (
	// ProjectStateStarted project state.
	ProjectStateStarted ProjectState = "STARTED"

	// ProjectStateStopped project state.
	ProjectStateStopped ProjectState = "STOPPED"

	// ProjectStateArchived project state.
	ProjectStateArchived ProjectState = "ARCHIVED"
)

// IsValid checks if the type is valid.
func (e ProjectState) IsValid() bool {
	switch e {
	case ProjectStateStarted, ProjectStateStopped, ProjectStateArchived:
		return true
	}

	return false
}

// String implements the fmt.Stringer interface.
func (e ProjectState) String() string {
	return string(e)
}

// Project entity definition.
type Project struct {
	ID                 string
	Name               string
	Description        string
	CreationDate       time.Time
	LastActivationDate string
	Favorite           bool
	AreToolsActive     bool
	Error              *string
	Repository         Repository
	Members            []Member
	ToolURLs           ToolUrls
	State              ProjectState
}

// NewProject is a constructor function.
func NewProject(name, description string) Project {
	return Project{Name: name, Description: description}
}
