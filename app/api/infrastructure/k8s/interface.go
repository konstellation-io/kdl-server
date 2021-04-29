package k8s

import "context"

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

// K8sClient defines all operation related to Kubernetes.
type K8sClient interface {
	CreateSecret(ctx context.Context, name string, values map[string]string) error
	UpdateSecret(ctx context.Context, name string, values map[string]string) error
	CreateUserToolsCR(ctx context.Context, username string) error
	DeleteUserToolsCR(ctx context.Context, username string) error
	IsUserToolPODRunning(ctx context.Context, username string) (bool, error)
	CreateKDLProjectCR(ctx context.Context, projectID string) error
}
