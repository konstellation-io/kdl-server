package entity

// Flavor entity definition.
type Flavor struct {
	ID           string
	Name         string
	Desc         string
	Labels       []string
	DockerImage  string
	UsertoolsPod string
	Running      bool
}
