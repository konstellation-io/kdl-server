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
	TLS             struct {
		Enabled    bool   `envconfig:"TOOLKIT_TLS"`
		SecretName string `envconfig:"TOOLKIT_TLS_SECRET_NAME"`
	}
	Admin struct {
		Username string `envconfig:"KDL_ADMIN_USERNAME"`
		Email    string `envconfig:"KDL_ADMIN_EMAIL"`
	}
	Storage struct {
		Size      string `envconfig:"USER_TOOLS_STORAGE_SIZE"`
		ClassName string `envconfig:"USER_TOOLS_STORAGE_CLASSNAME"`
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
		IsInsideCluster bool   `default:"true"`
		Namespace       string `envconfig:"POD_NAMESPACE"`
	} `yaml:"kubernetes"`
	Minio struct {
		Endpoint  string `envconfig:"MINIO_ENDPOINT"`
		AccessKey string `envconfig:"MINIO_ACCESS_KEY"`
		SecretKey string `envconfig:"MINIO_SECRET_KEY"`
	}
	Jupyter struct {
		URL   string `envconfig:"USER_TOOLS_JUPYTER_URL"`
		Image struct {
			Repository string `envconfig:"JUPYTER_IMG_REPO"`
			Tag        string `envconfig:"JUPYTER_IMG_TAG"`
			PullPolicy string `envconfig:"JUPYTER_IMG_PULLPOLICY"`
		}
		EnterpriseGatewayURL string `envconfig:"JUPYTER_ENTERPRISE_GATEWAY_URL"`
	}
	VSCode struct {
		URL   string `envconfig:"USER_TOOLS_VSCODE_URL"`
		Image struct {
			Repository string `envconfig:"VSCODE_IMG_REPO"`
			Tag        string `envconfig:"VSCODE_IMG_TAG"`
			PullPolicy string `envconfig:"VSCODE_IMG_PULLPOLICY"`
		}
	}
	Drone struct {
		URL         string `envconfig:"DRONE_URL"`
		InternalURL string `envconfig:"DRONE_INTERNAL_URL"`
		Token       string `envconfig:"DRONE_TOKEN"`
	}
	ProjectMLFlow struct {
		URL   string `envconfig:"PROJECT_MLFLOW_URL"`
		Image struct {
			Repository string `envconfig:"PROJECT_MLFLOW_IMG_REPO"`
			Tag        string `envconfig:"PROJECT_MLFLOW_IMG_TAG"`
			PullPolicy string `envconfig:"PROJECT_MLFLOW_IMG_PULLPOLICY"`
		}
		Volume struct {
			StorageClassName string `envconfig:"PROJECT_MLFLOW_STORAGE_CLASS_NAME"`
			Size             string `envconfig:"PROJECT_MLFLOW_STORAGE_SIZE"`
		}
	}
	ProjectFilebrowser struct {
		URL   string `envconfig:"PROJECT_FILEBROWSER_URL"`
		Image struct {
			Repository string `envconfig:"PROJECT_FILEBROWSER_IMG_REPO"`
			Tag        string `envconfig:"PROJECT_FILEBROWSER_IMG_TAG"`
			PullPolicy string `envconfig:"PROJECT_FILEBROWSER_IMG_PULLPOLICY"`
		}
	}
	Kg struct {
		Enabled bool   `envconfig:"KNOWLEDGE_GALAXY_ENABLED"`
		URL     string `envconfig:"KNOWLEDGE_GALAXY_URL"`
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
	RepoCloner struct {
		Image struct {
			Repository string `envconfig:"REPO_CLONER_IMG_REPO"`
			Tag        string `envconfig:"REPO_CLONER_IMG_TAG"`
			PullPolicy string `envconfig:"REPO_CLONER_IMG_PULLPOLICY"`
		}
	}
	UserToolsGiteaOAuth2Setup struct {
		Image struct {
			Repository string `envconfig:"USER_TOOLS_GITEA_OAUTH2_SETUP_IMG_REPO"`
			Tag        string `envconfig:"USER_TOOLS_GITEA_OAUTH2_SETUP_IMG_TAG"`
			PullPolicy string `envconfig:"USER_TOOLS_GITEA_OAUTH2_SETUP_IMG_PULLPOLICY"`
		}
	}
	UserToolsOAuth2Proxy struct {
		Image struct {
			Repository string `envconfig:"USER_TOOLS_OAUTH2_PROXY_IMG_REPO"`
			Tag        string `envconfig:"USER_TOOLS_OAUTH2_PROXY_IMG_TAG"`
			PullPolicy string `envconfig:"USER_TOOLS_OAUTH2_PROXY_IMG_PULLPOLICY"`
		}
	}
	UserToolsKubeconfig struct {
		Enabled           bool   `envconfig:"USER_TOOLS_KUBECONFIG_DOWNLOAD_ENABLED"`
		ExternalServerURL string `envconfig:"USER_TOOLS_KUBECONFIG_EXTERNAL_SERVER_URL"`
	}
	UserToolsVsCodeRuntime struct {
		Image struct {
			Repository string `envconfig:"USER_TOOLS_VSCODE_RUNTIME_IMG_REPO"`
			Tag        string `envconfig:"USER_TOOLS_VSCODE_RUNTIME_IMG_TAG"`
			PullPolicy string `envconfig:"USER_TOOLS_VSCODE_RUNTIME_IMG_PULLPOLICY"`
		}
	}
	UserToolsIngress struct {
		// Base64 encoded string of the ingress annotations
		Annotations string `envconfig:"USER_TOOLS_ENCODED_INGRESS_ANNOTATIONS"`
	}
	Labels struct {
		Common struct {
			Release string `envconfig:"LABELS_COMMON_RELEASE"`
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
