package config

import (
	"fmt"
	"os"
	"reflect"

	"github.com/kelseyhightower/envconfig"
)

type KeycloakConfig struct {
	AdminUserKey     string `envconfig:"KEYCLOAK_ADMIN_USER"`
	AdminPasswordKey string `envconfig:"KEYCLOAK_PASSWORD_KEY"`
	AdminClientIDKey string `envconfig:"KEYCLOAK_ADMIN_CLIENT_ID"`
	MasterRealmKey   string `envconfig:"KEYCLOAK_MASTER_REALM"`
	RealmKey         string `envconfig:"KEYCLOAK_REALM"`
	URLKey           string `envconfig:"KEYCLOAK_URL"`
}

type KubernetesConfig struct {
	Namespace       string `envconfig:"POD_NAMESPACE"`
	IsInsideCluster bool   `default:"true"`
}

// Config holds the configuration values of the application.
type Config struct {
	Port                  string `envconfig:"KDL_SERVER_PORT" default:"8080"`
	ProjectMLFlowURL      string `envconfig:"PROJECT_MLFLOW_URL"`
	ProjectFilebrowserURL string `envconfig:"PROJECT_FILEBROWSER_URL"`
	ReleaseName           string `envconfig:"RELEASE_NAME"`
	StaticFilesPath       string `envconfig:"KDL_SERVER_STATIC_FILES_PATH" default:"../public"`
	VSCodeURL             string `envconfig:"USER_TOOLS_VSCODE_URL"`
	MongoDB               struct {
		URI    string `envconfig:"KDL_SERVER_MONGODB_URI"`
		DBName string `envconfig:"KDL_SERVER_MONGODB_NAME" default:"kdl"`
	}
	Keycloak   KeycloakConfig
	Kubernetes KubernetesConfig
	Minio      struct {
		Endpoint  string `envconfig:"MINIO_ENDPOINT"`
		AccessKey string `envconfig:"MINIO_ACCESS_KEY"`
		SecretKey string `envconfig:"MINIO_SECRET_KEY"`
	}
	Kg struct {
		Enabled bool   `envconfig:"KNOWLEDGE_GALAXY_ENABLED" default:"false"`
		URL     string `envconfig:"KNOWLEDGE_GALAXY_URL"`
	}
	Kubeconfig struct {
		Enabled           bool   `envconfig:"KUBECONFIG_DOWNLOAD_ENABLED" default:"false"`
		ExternalServerURL string `envconfig:"KUBECONFIG_EXTERNAL_SERVER_URL"`
	}
	UserToolsOAuth2Proxy struct {
		Image struct {
			Repository string `envconfig:"USER_TOOLS_OAUTH2_PROXY_IMG_REPO"`
			Tag        string `envconfig:"USER_TOOLS_OAUTH2_PROXY_IMG_TAG"`
			PullPolicy string `envconfig:"USER_TOOLS_OAUTH2_PROXY_IMG_PULLPOLICY"`
		}
	}
	UserToolsVsCodeRuntime struct {
		Image struct {
			Repository string `envconfig:"USER_TOOLS_VSCODE_RUNTIME_IMG_REPO"`
			Tag        string `envconfig:"USER_TOOLS_VSCODE_RUNTIME_IMG_TAG"`
			PullPolicy string `envconfig:"USER_TOOLS_VSCODE_RUNTIME_IMG_PULLPOLICY"`
		}
	}
	VSCode struct {
		URL     string `envconfig:"USER_TOOLS_VSCODE_URL"`
		Enabled bool   `envconfig:"USER_TOOLS_VSCODE_ENABLED"`
		Image   struct {
			Repository string `envconfig:"VSCODE_IMG_REPO"`
			Tag        string `envconfig:"VSCODE_IMG_TAG"`
			PullPolicy string `envconfig:"VSCODE_IMG_PULLPOLICY"`
		}
	}
}

// NewConfig will read the values from env vars.
func NewConfig() Config {
	cfg := Config{}

	err := envconfig.Process("", &cfg)
	if err != nil {
		panic(err)
	}

	v := reflect.ValueOf(cfg)
	for i := 0; i < v.NumField(); i++ {
		field := v.Field(i)
		if field.Interface() == reflect.Zero(field.Type()).Interface() {
			panic(fmt.Sprintf("field %s cannot be empty", v.Type().Field(i).Name))
		}
	}

	if os.Getenv("KDL_ENV") == "dev" {
		cfg.Kubernetes.IsInsideCluster = false
	}

	return cfg
}
