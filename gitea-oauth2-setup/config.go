package main

import (
	"fmt"
	"os"
	"strings"

	"github.com/kelseyhightower/envconfig"
)

// Config holds the configuration values for the application.
type Config struct {
	Gitea struct {
		URL          string `envconfig:"GITEA_URL" required:"true"`
		Username     string `envconfig:"GITEA_ADMIN_USER" required:"true"`
		Password     string `envconfig:"GITEA_ADMIN_PASSWORD" required:"true"`
		AppName      string `envconfig:"GITEA_APPLICATION_NAME" required:"true"`
		RedirectUris []string
	}
	Credentials struct {
		SecretName string `envconfig:"DEPLOYMENT_SECRET_NAME" required:"true"`
	}
	Kubernetes struct {
		Namespace       string `envconfig:"POD_NAMESPACE" required:"true"`
		IsInsideCluster bool
	} `yaml:"kubernetes"`
	Timeout int `envconfig:"GITEA_INIT_TIMEOUT" default:"200"`
}

// NewConfig will read the config.yml file and override values with env vars.
func NewConfig() (Config, error) {
	cfg := Config{}

	if os.Getenv("KUBERNETES_PORT") != "" {
		cfg.Kubernetes.IsInsideCluster = true
	}

	giteaRedirectURIEnv := "GITEA_REDIRECT_URIS"

	cfg.Gitea.RedirectUris = strings.Split(os.Getenv(giteaRedirectURIEnv), ",")
	if len(cfg.Gitea.RedirectUris) == 0 && os.Getenv(giteaRedirectURIEnv) == "" {
		return cfg, fmt.Errorf("%w: %s", ErrMissingEnvValue, giteaRedirectURIEnv)
	}

	err := envconfig.Process("", &cfg)
	if err != nil {
		return cfg, fmt.Errorf("error parsing environment config: %w", err)
	}

	return cfg, nil
}
