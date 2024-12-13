package k8s

import (
	"context"

	v1 "k8s.io/api/core/v1"

	"github.com/konstellation-io/kdl-server/app/api/entity"
)

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

// ClientInterface defines all operation related to Kubernetes.
type ClientInterface interface {
	CreateSecret(ctx context.Context, name string, values, labels map[string]string) error
	UpdateSecret(ctx context.Context, name string, values, labels map[string]string) error
	GetSecret(ctx context.Context, name string) (map[string][]byte, error)
	CreateUserToolsCR(ctx context.Context, username, runtimeID, runtimeImage, runtimeTag string, capabilities entity.Capabilities) error
	DeleteUserToolsCR(ctx context.Context, username string) error
	IsUserToolPODRunning(ctx context.Context, username string) (bool, error)
	GetRuntimeIDFromUserTools(ctx context.Context, username string) (string, error)
	GetCapabilitiesIDFromUserTools(ctx context.Context, username string) (string, error)
	CreateKDLProjectCR(ctx context.Context, projectID string) error
	DeleteKDLProjectCR(ctx context.Context, projectID string) error
	CreateUserSSHKeySecret(ctx context.Context, user entity.User, public, private string) error
	UpdateUserSSHKeySecret(ctx context.Context, user entity.User, public, private string) error
	GetUserSSHKeySecret(ctx context.Context, usernameSlug string) ([]byte, error)
	GetUserSSHKeyPublic(ctx context.Context, usernameSlug string) ([]byte, error)
	CreateUserServiceAccount(ctx context.Context, usernameSlug string) (*v1.ServiceAccount, error)
	DeleteUserServiceAccount(ctx context.Context, usernameSlug string) error
	GetUserServiceAccount(ctx context.Context, usernameSlug string) (*v1.ServiceAccount, error)
	GetUserKubeconfig(ctx context.Context, usernameSlug string) ([]byte, error)
}
