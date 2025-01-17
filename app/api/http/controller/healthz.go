package controller

import (
	"encoding/json"
	"net/http"

	"github.com/konstellation-io/kdl-server/app/api/infrastructure/k8s"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/minioservice"
	"github.com/konstellation-io/kdl-server/app/api/pkg/mongodbutils"
)

// Healthz struct to return the health status of the services.
type Healthz struct {
	MinioConnection bool `json:"minio_connection"`
	K8sConnection   bool `json:"k8s_connection"`
	MongoConnection bool `json:"mongo_connection"`
	ServerRunning   bool `json:"server_running"`
}

// HealthzController is the controller for the healthz endpoint.
type HealthzController struct {
	minioService  minioservice.MinioService
	k8sClient     k8s.ClientInterface
	mongodbClient *mongodbutils.MongoDB
}

// NewHealthzController is a constructor function.
func NewHealthzController(
	minioService minioservice.MinioService,
	k8sClient k8s.ClientInterface,
	mongodbClient *mongodbutils.MongoDB,
) *HealthzController {
	return &HealthzController{
		minioService:  minioService,
		k8sClient:     k8sClient,
		mongodbClient: mongodbClient,
	}
}

// HandleHealthz is the handler for the healthz endpoint.
func (h *HealthzController) HandleHealthz(w http.ResponseWriter, _ *http.Request) {
	healthz := Healthz{
		MinioConnection: h.minioService.CheckConnection(),
		K8sConnection:   h.k8sClient.CheckConnection(),
		MongoConnection: h.mongodbClient.Ping(),
		ServerRunning:   true,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(healthz); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
