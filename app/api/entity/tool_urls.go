package entity

// ToolUrls entity definition.
type ToolUrls struct {
	Gitea   string `json:"gitea"`
	Minio   string `json:"minio"`
	Jupyter string `json:"jupyter"`
	VSCode  string `json:"vscode"`
	Drone   string `json:"drone"`
	MLFlow  string `json:"mlflow"`
}
