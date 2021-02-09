package entity

// ToolName is an enum for tool names.
type ToolName string

const (
	// ToolNameGitea tool name.
	ToolNameGitea ToolName = "GITEA"

	// ToolNameMinio tool name.
	ToolNameMinio ToolName = "MINIO"

	// ToolNameJupyter tool name.
	ToolNameJupyter ToolName = "JUPYTER"

	// ToolNameVscode tool name.
	ToolNameVscode ToolName = "VSCODE"

	// ToolNameDrone tool name.
	ToolNameDrone ToolName = "DRONE"

	// ToolNameMlflow tool name.
	ToolNameMlflow ToolName = "MLFLOW"
)

// IsValid checks if the type is valid.
func (e ToolName) IsValid() bool {
	switch e {
	case ToolNameGitea, ToolNameMinio, ToolNameJupyter, ToolNameVscode, ToolNameDrone, ToolNameMlflow:
		return true
	}

	return false
}

// String implements the fmt.Stringer interface.
func (e ToolName) String() string {
	return string(e)
}

// Tool entity definition.
type Tool struct {
	ID       string
	ToolName ToolName
	URL      string
}
