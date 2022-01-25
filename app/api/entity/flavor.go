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

// NewFlavor is a constructor function.
func NewFlavor(id, name string, running bool) Flavor {
	return Flavor{ID: id, Name: name, Running: running}
}
