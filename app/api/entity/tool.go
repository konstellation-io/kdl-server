package entity

type ToolName string

const (
	ToolNameGitea   ToolName = "GITEA"
	ToolNameMinio   ToolName = "MINIO"
	ToolNameJupyter ToolName = "JUPYTER"
	ToolNameVscode  ToolName = "VSCODE"
	ToolNameDrone   ToolName = "DRONE"
	ToolNameMlflow  ToolName = "MLFLOW"
)

func (e ToolName) IsValid() bool {
	switch e {
	case ToolNameGitea, ToolNameMinio, ToolNameJupyter, ToolNameVscode, ToolNameDrone, ToolNameMlflow:
		return true
	}
	return false
}

func (e ToolName) String() string {
	return string(e)
}

type Tool struct {
	ID       string
	ToolName ToolName
	URL      string
}
