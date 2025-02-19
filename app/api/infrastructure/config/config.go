package config

import (
	"errors"
	"fmt"
	"os"
	"reflect"

	"github.com/kelseyhightower/envconfig"
)

var (
	errFieldEmpty = errors.New("cannot be empty")
	errNilStruct  = errors.New("struct is nil")
	errValidation = errors.New("validation error")
)

type KeycloakConfig struct {
	AdminUser        string `envconfig:"KEYCLOAK_ADMIN_USER" optional:"true"`
	AdminPasswordKey string `envconfig:"KEYCLOAK_PASSWORD_KEY" optional:"true"`
	AdminClientID    string `envconfig:"KEYCLOAK_ADMIN_CLIENT_ID" optional:"true"`
	MasterRealm      string `envconfig:"KEYCLOAK_MASTER_REALM" optional:"true"`
	Realm            string `envconfig:"KEYCLOAK_REALM" optional:"true"`
	URL              string `envconfig:"KEYCLOAK_URL" optional:"true"`
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
	WatchConfigMap        bool   `envconfig:"KDL_WATCHER_CONFIGMAP_ENABLED" default:"false"`
	MongoDB               struct {
		URI    string `envconfig:"KDL_SERVER_MONGODB_URI"`
		DBName string `envconfig:"KDL_SERVER_MONGODB_NAME" default:"kdl"`
	}
	Keycloak   KeycloakConfig
	Kubernetes KubernetesConfig
	Minio      struct {
		Endpoint   string `envconfig:"MINIO_ENDPOINT"`
		AccessKey  string `envconfig:"MINIO_ACCESS_KEY"`
		SecretKey  string `envconfig:"MINIO_SECRET_KEY"`
		ConsoleURL string `envconfig:"MINIO_CONSOLE_ENDPOINT"`
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
	return validateStruct(reflect.ValueOf(c).Elem())
}

func validateStruct(v reflect.Value) error {
	if v.Kind() == reflect.Ptr {
		if v.IsNil() {
			return errNilStruct
		}

		v = v.Elem()
	}

	if v.Kind() != reflect.Struct {
		return nil
	}

	for i := 0; i < v.NumField(); i++ {
		field := v.Field(i)
		fieldType := v.Type().Field(i)

		if err := validateField(field, fieldType); err != nil {
			return fmt.Errorf("%w: field %s", errValidation, fieldType.Name)
		}
	}

	return nil
}

func validateField(field reflect.Value, fieldType reflect.StructField) error {
	// check if the field is a struct and call validateStruct recursively
	if field.Kind() == reflect.Struct {
		if err := validateStruct(field); err != nil {
			return fmt.Errorf("error in field %s: %w", fieldType.Name, err)
		}

		return nil
	}
	// optional field, continue
	if fieldType.Tag.Get("optional") == "true" {
		return nil
	}

	// check if the field is a bool, if so, continue
	if field.Kind() == reflect.Bool {
		return nil
	}

	if reflect.DeepEqual(field.Interface(), reflect.Zero(field.Type()).Interface()) {
		// return error if field is empty
		return fmt.Errorf("%w: %s", errFieldEmpty, fieldType.Name)
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
