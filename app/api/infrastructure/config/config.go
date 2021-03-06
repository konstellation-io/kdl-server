package config

import (
	"log"
	"os"
	"time"

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
	Admin           struct {
		Username string `envconfig:"KDL_ADMIN_USERNAME"`
		Email    string `envconfig:"KDL_ADMIN_EMAIL"`
	}
	Storage struct {
		Size      string `envconfig:"TOOLKIT_VSCODE_STORAGE_SIZE"`
		ClassName string `envconfig:"TOOLKIT_VSCODE_STORAGE_CLASSNAME"`
	}
	SharedVolume struct {
		Name string `envconfig:"TOOLKIT_SHARED_VOLUME"`
	}
	MongoDB struct {
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
		Endpoint  string `envconfig:"MINIO_ENDPOINT"`
		AccessKey string `envconfig:"MINIO_ACCESS_KEY"`
		SecretKey string `envconfig:"MINIO_SECRET_KEY"`
	}
	Filebrowser struct {
		URL string `envconfig:"FILEBROWSER_URL"`
	}
	Jupyter struct {
		URL string `envconfig:"JUPYTER_URL"`
	}
	VSCode struct {
		URL     string `envconfig:"VSCODE_URL"`
		Ingress struct {
			Type string `envconfig:"TOOLKIT_INGRESS_TYPE"`
		}
	}
	Drone struct {
		URL         string `envconfig:"DRONE_URL"`
		InternalURL string `envconfig:"DRONE_INTERNAL_URL"`
		Token       string `envconfig:"DRONE_TOKEN"`
	}
	MLFlow struct {
		URL   string `envconfig:"MLFLOW_URL"`
		Image struct {
			Repository string `envconfig:"MLFLOW_IMG_REPO"`
			Tag        string `envconfig:"MLFLOW_IMG_TAG"`
			PullPolicy string `envconfig:"MLFLOW_IMG_PULLPOLICY"`
		}
		Volume struct {
			StorageClassName string `envconfig:"MLFLOW_STORAGE_CLASS_NAME"`
			Size             string `envconfig:"MLFLOW_STORAGE_SIZE"`
		}
	}
	KGservice struct {
		URL string `envconfig:"KG_URL"`
	}
	ScheduledJob struct {
		UsersSync struct {
			Interval time.Duration `yaml:"interval" envconfig:"CRONJOB_USERS_SYNC_INTERVAL"`
		} `yaml:"usersSync"`
	} `yaml:"scheduledJob"`
	OAuth2Proxy struct {
		Image struct {
			Repository string `envconfig:"OAUTH2_PROXY_IMG_REPO"`
			Tag        string `envconfig:"OAUTH2_PROXY_IMG_TAG"`
			PullPolicy string `envconfig:"OAUTH2_PROXY_IMG_PULLPOLICY"`
		}
	}
	GiteaOAuth2Setup struct {
		Image struct {
			Repository string `envconfig:"GITEA_OAUTH2_SETUP_IMG_REPO"`
			Tag        string `envconfig:"GITEA_OAUTH2_SETUP_IMG_TAG"`
			PullPolicy string `envconfig:"GITEA_OAUTH2_SETUP_IMG_PULLPOLICY"`
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

	return cfg
}
