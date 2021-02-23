package k8s

import "context"

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

// K8sClient defines all operation related to Kubernetes.
type K8sClient interface {
	CreateSecret(name string, values map[string]string) error
	CreateUserToolsCR(ctx context.Context, username string) error
	DeleteUserToolsCR(ctx context.Context, username string) error
	IsUserToolPODRunning(username string) (bool, error)
}
