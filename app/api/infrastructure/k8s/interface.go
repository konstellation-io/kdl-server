package k8s

import (
	"context"

	"github.com/konstellation-io/kdl-server/app/api/entity"
)

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

// K8sClient defines all operation related to Kubernetes.
type K8sClient interface {
	CreateSecret(ctx context.Context, name string, values map[string]string) error
	UpdateSecret(ctx context.Context, name string, values map[string]string) error
	GetSecret(ctx context.Context, name string) (map[string][]byte, error)
	CreateUserToolsCR(ctx context.Context, username string, runtimeId string, runtimeImage string) error
	DeleteUserToolsCR(ctx context.Context, username string) error
	IsUserToolPODRunning(ctx context.Context, username string) (bool, error)
	GetRunningRuntimePODRuntimeId(ctx context.Context, username string) (string, error)
	CreateKDLProjectCR(ctx context.Context, projectID string) error
	CreateUserSSHKeySecret(ctx context.Context, user entity.User, public, private string) error
	UpdateUserSSHKeySecret(ctx context.Context, user entity.User, public, private string) error
	GetUserSSHKeySecret(ctx context.Context, usernameSlug string) ([]byte, error)
	GetUserSSHKeyPublic(ctx context.Context, usernameSlug string) ([]byte, error)
}
