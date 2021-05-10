package entity

// ToolUrls entity definition.
type ToolUrls struct {
	Gitea       string `json:"gitea"`
	Filebrowser string `json:"filebrowser"`
	Jupyter     string `json:"jupyter"`
	VSCode      string `json:"vscode"`
	Drone       string `json:"drone"`
	MLFlow      string `json:"mlflow"`
}
