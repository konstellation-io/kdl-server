package entity

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
	Favorite           bool
	Repository         *Repository
	State              ProjectState
	CreationDate       string
	LastActivationDate string
	Error              *string
	Members            []Member
	Tools              []Tool
	AreToolsActive     bool
}

func NewProject(name string, description string) Project {
	return Project{Name: name, Description: description}
}
