package k8s

import (
	"context"

	v1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/watch"

	"github.com/konstellation-io/kdl-server/app/api/entity"
)

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

// ClientInterface defines all operation related to Kubernetes.
type ClientInterface interface {
	CheckConnection() bool
	CreateSecret(ctx context.Context, name string, values, labels map[string]string) error
	UpdateSecret(ctx context.Context, name string, values, labels map[string]string) error
	GetSecret(ctx context.Context, name string) (map[string][]byte, error)
	CreateKDLUserToolsCR(ctx context.Context, username string, data UserToolsData) error
	DeleteUserToolsCR(ctx context.Context, username string) error
	UpdateKDLUserToolsCR(ctx context.Context, resourceName string, data UserToolsData, crd *map[string]interface{}) error
	ListKDLUserToolsCR(ctx context.Context) ([]unstructured.Unstructured, error)
	GetKDLUserToolsCR(ctx context.Context, username string) (*unstructured.Unstructured, error)
	GetUserToolsPodStatus(ctx context.Context, username string) (entity.PodStatus, error)
	IsUserToolPODRunning(ctx context.Context, username string) (bool, error)
	GetRuntimeIDFromUserTools(ctx context.Context, username string) (string, error)
	GetCapabilitiesIDFromUserTools(ctx context.Context, username string) (string, error)
	CreateKDLProjectCR(ctx context.Context, projectID string) error
	DeleteKDLProjectCR(ctx context.Context, projectID string) error
	UpdateKDLProjectsCR(ctx context.Context, projectID string, crd *map[string]interface{}) error
	ListKDLProjectsNameCR(ctx context.Context) ([]string, error)
	GetKDLProjectCR(ctx context.Context, name string) (*unstructured.Unstructured, error)
	CreateUserSSHKeySecret(ctx context.Context, user entity.User, public, private string) error
	UpdateUserSSHKeySecret(ctx context.Context, user entity.User, public, private string) error
	GetUserSSHKeySecret(ctx context.Context, usernameSlug string) ([]byte, error)
	GetUserSSHKeyPublic(ctx context.Context, usernameSlug string) ([]byte, error)
	CreateUserServiceAccount(ctx context.Context, usernameSlug string) (*v1.ServiceAccount, error)
	DeleteUserServiceAccount(ctx context.Context, usernameSlug string) error
	GetUserServiceAccount(ctx context.Context, usernameSlug string) (*v1.ServiceAccount, error)
	GetUserKubeconfig(ctx context.Context, usernameSlug string) ([]byte, error)
	GetConfigMap(ctx context.Context, name string) (*v1.ConfigMap, error)
	GetConfigMapTemplateNameKDLProject() string
	GetConfigMapTemplateNameKDLUserTools() string
	CreateConfigMapWatcher(ctx context.Context) (watch.Interface, error)
}
