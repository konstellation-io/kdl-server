package entity

// ToolUrls entity definition.
type ToolUrls struct {
	KnowledgeGalaxyEnabled bool   `json:"KnowledgeGalaxyEnabled"`
	KnowledgeGalaxy        string `json:"knowledgeGalaxy"`
	Filebrowser            string `json:"filebrowser"`
	MLFlow                 string `json:"mlflow"`
	Minio                  string `json:"minio"`
}
