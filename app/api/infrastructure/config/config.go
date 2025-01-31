package config

import (
	"errors"
	"fmt"
	"os"
	"reflect"

	"github.com/kelseyhightower/envconfig"
)

var errFieldEmpty = errors.New("cannot be empty")

type KeycloakConfig struct {
	AdminUser        string `envconfig:"KEYCLOAK_ADMIN_USER"`
	AdminPasswordKey string `envconfig:"KEYCLOAK_PASSWORD_KEY"`
	AdminClientID    string `envconfig:"KEYCLOAK_ADMIN_CLIENT_ID"`
	MasterRealm      string `envconfig:"KEYCLOAK_MASTER_REALM"`
	Realm            string `envconfig:"KEYCLOAK_REALM"`
	URL              string `envconfig:"KEYCLOAK_URL"`
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
	MongoDB               struct {
		URI    string `envconfig:"KDL_SERVER_MONGODB_URI"`
		DBName string `envconfig:"KDL_SERVER_MONGODB_NAME" default:"kdl"`
	}
	Keycloak   KeycloakConfig `optional:"true"`
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
	Labels struct {
		Common struct {
			AppRelease   string `envconfig:"LABELS_COMMON_APP_RELEASE"`
			ChartRelease string `envconfig:"LABELS_COMMON_CHART_RELEASE"`
		}
	}
}

func (c *Config) Validate() error {
	v := reflect.ValueOf(*c)
	t := reflect.TypeOf(*c)

	for i := 0; i < v.NumField(); i++ {
		fieldType := t.Field(i)

		optionalTag := fieldType.Tag.Get("optional")
		if optionalTag == "true" {
			continue
		}

		field := v.Field(i)
		if field.Interface() == reflect.Zero(field.Type()).Interface() {
			return fmt.Errorf("error in field %s: %w", v.Type().Field(i).Name, errFieldEmpty)
		}
	}

	return nil
}

// NewConfig will read the values from env vars.
func NewConfig() Config {
	cfg := Config{}

	err := envconfig.Process("", &cfg)
	if err != nil {
		panic(err)
	}

	err = cfg.Validate()
	if err != nil {
		panic(err)
	}

	if os.Getenv("KDL_ENV") == "dev" {
		cfg.Kubernetes.IsInsideCluster = false
	}

	return cfg
}
