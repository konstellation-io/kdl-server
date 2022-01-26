package entity

// Runtime entity definition.
type Runtime struct {
	ID           string
	Name         string
	Desc         string
	Labels       []string
	DockerImage  string
	UsertoolsPod string
}

// NewRuntime is a constructor function.
func NewRuntime(id, name, dockerImage string) Runtime {
	return Runtime{ID: id, Name: name, DockerImage: dockerImage}
}
