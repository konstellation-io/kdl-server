package config

import (
	"log"
	"os"

	"github.com/kelseyhightower/envconfig"
	"gopkg.in/yaml.v3"
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
	BaseDomainName  string `envconfig:"BASE_DOMAIN_NAME"`
	LogLevel        string `yaml:"logLevel" envconfig:"KDL_SERVER_LOG_LEVEL"` // currently unused
	Port            string `yaml:"port" envconfig:"KDL_SERVER_PORT"`
	StaticFilesPath string `yaml:"staticFilesPath" envconfig:"KDL_SERVER_STATIC_FILES_PATH"`

	Keycloak KeycloakConfig
	Kg       struct {
		Enabled bool   `envconfig:"KNOWLEDGE_GALAXY_ENABLED"`
		URL     string `envconfig:"KNOWLEDGE_GALAXY_URL"`
	}
	Kubernetes KubernetesConfig `yaml:"kubernetes"`
	Labels     struct {
		Common struct {
			AppRelease   string `envconfig:"LABELS_COMMON_APP_RELEASE"`
			ChartRelease string `envconfig:"LABELS_COMMON_CHART_RELEASE"`
		}
	}
	Minio struct {
		Endpoint  string `envconfig:"MINIO_ENDPOINT"`
		AccessKey string `envconfig:"MINIO_ACCESS_KEY"`
		SecretKey string `envconfig:"MINIO_SECRET_KEY"`
	}
	MongoDB struct {
		URI    string `yaml:"uri" envconfig:"KDL_SERVER_MONGODB_URI"`
		DBName string `yaml:"dbName" envconfig:"KDL_SERVER_MONGODB_NAME"`
	} `yaml:"mongodb"`
	OAuth2Proxy struct {
		Image struct {
			Repository string `envconfig:"OAUTH2_PROXY_IMG_REPO"`
			Tag        string `envconfig:"OAUTH2_PROXY_IMG_TAG"`
			PullPolicy string `envconfig:"OAUTH2_PROXY_IMG_PULLPOLICY"`
		}
	}
	ProjectFilebrowser struct {
		URL   string `envconfig:"PROJECT_FILEBROWSER_URL"`
		Image struct {
			Repository string `envconfig:"PROJECT_FILEBROWSER_IMG_REPO"`
			Tag        string `envconfig:"PROJECT_FILEBROWSER_IMG_TAG"`
			PullPolicy string `envconfig:"PROJECT_FILEBROWSER_IMG_PULLPOLICY"`
		}
		NodeSelector string `envconfig:"PROJECT_FILEBROWSER_NODESELECTOR"`
		Affinity     string `envconfig:"PROJECT_FILEBROWSER_AFFINITY"`
		Tolerations  string `envconfig:"PROJECT_FILEBROWSER_TOLERATIONS"`
	}
	ProjectMLFlow struct {
		URL   string `envconfig:"PROJECT_MLFLOW_URL"`
		Image struct {
			Repository string `envconfig:"PROJECT_MLFLOW_IMG_REPO"`
			Tag        string `envconfig:"PROJECT_MLFLOW_IMG_TAG"`
			PullPolicy string `envconfig:"PROJECT_MLFLOW_IMG_PULLPOLICY"`
		}
		Ingress struct {
			ClassName   string `envconfig:"PROJECT_MLFLOW_INGRESS_CLASS_NAME"`
			Annotations string `envconfig:"PROJECT_MLFLOW_ENCODED_INGRESS_ANNOTATIONS"`
			TLS         struct {
				SecretName *string `envconfig:"PROJECT_MLFLOW_INGRESS_TLS_SECRET_NAME"`
			}
		}
		NodeSelector string `envconfig:"PROJECT_MLFLOW_NODESELECTOR"`
		Affinity     string `envconfig:"PROJECT_MLFLOW_AFFINITY"`
		Tolerations  string `envconfig:"PROJECT_MLFLOW_TOLERATIONS"`
		Volume       struct {
			StorageClassName string `envconfig:"PROJECT_MLFLOW_STORAGE_CLASS_NAME"`
			Size             string `envconfig:"PROJECT_MLFLOW_STORAGE_SIZE"`
		}
	}
	RepoCloner struct {
		Image struct {
			Repository string `envconfig:"REPO_CLONER_IMG_REPO"`
			Tag        string `envconfig:"REPO_CLONER_IMG_TAG"`
			PullPolicy string `envconfig:"REPO_CLONER_IMG_PULLPOLICY"`
		}
	}
	SharedVolume struct {
		Name string `envconfig:"SHARED_VOLUME"`
	}
	Storage struct {
		Size      string `envconfig:"USER_TOOLS_STORAGE_SIZE"`
		ClassName string `envconfig:"USER_TOOLS_STORAGE_CLASSNAME"`
	}
	TLS struct {
		Enabled bool `envconfig:"TLS_ENABLED"`
	}
	UserToolsKubeconfig struct {
		Enabled           bool   `envconfig:"USER_TOOLS_KUBECONFIG_DOWNLOAD_ENABLED"`
		ExternalServerURL string `envconfig:"USER_TOOLS_KUBECONFIG_EXTERNAL_SERVER_URL"`
	}
	UserToolsIngress struct {
		// Base64 encoded string of the ingress annotations
		Annotations string `envconfig:"USER_TOOLS_ENCODED_INGRESS_ANNOTATIONS"`
		ClassName   string `envconfig:"USER_TOOLS_INGRESS_CLASS_NAME"`
		TLS         struct {
			SecretName *string `envconfig:"USER_TOOLS_TLS_SECRET_NAME"`
		}
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
