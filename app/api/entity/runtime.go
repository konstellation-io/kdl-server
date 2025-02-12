package entity

// Runtime entity definition.
type Runtime struct {
	ID               string
	Name             string
	Desc             string
	Labels           []string
	DockerImage      string
	DockerTag        string
	RuntimePod       string
	RuntimePodStatus PodStatus
}

// NewRuntime is a constructor function.
func NewRuntime(id, name, dockerImage, dockerTag string) Runtime {
	return Runtime{ID: id, Name: name, DockerImage: dockerImage, DockerTag: dockerTag}
}
