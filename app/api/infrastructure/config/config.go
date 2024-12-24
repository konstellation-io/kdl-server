package config

import (
	"log"
	"os"

	"github.com/kelseyhightower/envconfig"
	"gopkg.in/yaml.v3"
)

type KubernetesConfig struct {
	Namespace       string `envconfig:"POD_NAMESPACE"`
	IsInsideCluster bool   `default:"true"`
}

// Config holds the configuration values of the application.
type Config struct {
	Port                  string `yaml:"port" envconfig:"KDL_SERVER_PORT"`
	ProjectMLFlowURL      string `envconfig:"PROJECT_MLFLOW_URL"`
	ProjectFilebrowserURL string `envconfig:"PROJECT_FILEBROWSER_URL"`
	ReleaseName           string `envconfig:"RELEASE_NAME"`
	StaticFilesPath       string `yaml:"staticFilesPath" envconfig:"KDL_SERVER_STATIC_FILES_PATH"`
	VSCodeURL             string `envconfig:"USER_TOOLS_VSCODE_URL"`
	MongoDB struct {
		URI    string `yaml:"uri" envconfig:"KDL_SERVER_MONGODB_URI"`
		DBName string `yaml:"dbName" envconfig:"KDL_SERVER_MONGODB_NAME"`
	} `yaml:"mongodb"`
	Kubernetes KubernetesConfig `yaml:"kubernetes"`
	Minio      struct {
		Endpoint  string `envconfig:"MINIO_ENDPOINT"`
		AccessKey string `envconfig:"MINIO_ACCESS_KEY"`
		SecretKey string `envconfig:"MINIO_SECRET_KEY"`
	}
	Kg struct {
		Enabled bool   `envconfig:"KNOWLEDGE_GALAXY_ENABLED"`
		URL     string `envconfig:"KNOWLEDGE_GALAXY_URL"`
	}
	Kubeconfig struct {
		Enabled           bool   `envconfig:"KUBECONFIG_DOWNLOAD_ENABLED"`
		ExternalServerURL string `envconfig:"KUBECONFIG_EXTERNAL_SERVER_URL"`
	}
	Labels struct {
		Common struct {
			AppRelease   string `envconfig:"LABELS_COMMON_APP_RELEASE"`
			ChartRelease string `envconfig:"LABELS_COMMON_CHART_RELEASE"`
		}
	}
}

// NewConfig will read the config.yml file and override values with env vars.
func NewConfig() Config {
	f, err := os.Open("config.yml")
	if err != nil {
		log.Fatalf("Error opening config.yml: %s", err)
	}

	cfg := Config{}
	decoder := yaml.NewDecoder(f)

	err = decoder.Decode(&cfg)
	if err != nil {
		log.Fatalf("Error loading config.yml: %s", err)
	}

	err = envconfig.Process("", &cfg)
	if err != nil {
		panic(err)
	}

	if os.Getenv("KDL_ENV") == "dev" {
		cfg.Kubernetes.IsInsideCluster = false
	}

	return cfg
}
