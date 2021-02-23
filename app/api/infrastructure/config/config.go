package config

import (
	"log"
	"os"

	"github.com/kelseyhightower/envconfig"
	"gopkg.in/yaml.v3"
)

// Config holds the configuration values of the application.
type Config struct {
	LogLevel        string `yaml:"logLevel" envconfig:"KDL_SERVER_LOG_LEVEL"`
	Port            string `yaml:"port" envconfig:"KDL_SERVER_PORT"`
	StaticFilesPath string `yaml:"staticFilesPath" envconfig:"KDL_SERVER_STATIC_FILES_PATH"`
	BaseDomainName  string `envconfig:"TOOLKIT_BASE_DOMAIN_NAME"`
	TLS             bool   `envconfig:"TOOLKIT_TLS"`
	MongoDB         struct {
		URI    string `yaml:"uri" envconfig:"KDL_SERVER_MONGODB_URI"`
		DBName string `yaml:"dbName"`
	} `yaml:"mongodb"`
	Gitea struct {
		InternalURL string `yaml:"internal_url" envconfig:"GITEA_INTERNAL_URL"`
		URL         string `envconfig:"GITEA_URL"`
		AdminUser   string `envconfig:"GITEA_ADMIN_USER"`
		AdminPass   string `envconfig:"GITEA_ADMIN_PASSWORD"`
	} `yaml:"gitea"`
	Kubernetes struct {
		Namespace string `envconfig:"POD_NAMESPACE"`
	} `yaml:"kubernetes"`
	Minio struct {
		URL       string `envconfig:"MINIO_URL"`
		Endpoint  string `envconfig:"MINIO_ENDPOINT"`
		AccessKey string `envconfig:"MINIO_ACCESS_KEY"`
		SecretKey string `envconfig:"MINIO_SECRET_KEY"`
	}
	Jupyter struct {
		URL string `envconfig:"JUPYTER_URL"`
	}
	VSCode struct {
		URL     string `envconfig:"VSCODE_URL"`
		Ingress struct {
			Type string `envconfig:"TOOLKIT_INGRESS_TYPE"`
		}
		Storage struct {
			Size      string `envconfig:"TOOLKIT_VSCODE_STORAGE_SIZE"`
			ClassName string `envconfig:"TOOLKIT_VSCODE_STORAGE_CLASSNAME"`
		}
		SharedVolume struct {
			Name string `envconfig:"TOOLKIT_SHARED_VOLUME"`
		}
	}
	Drone struct {
		URL         string `envconfig:"DRONE_URL"`
		InternalURL string `envconfig:"DRONE_INTERNAL_URL"`
		Token       string `envconfig:"DRONE_TOKEN"`
	}
	MLFlow struct {
		URL string `envconfig:"MLFLOW_URL"`
	}
	KGservice struct {
		URL string `envconfig:"KG_URL"`
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

	return cfg
}
