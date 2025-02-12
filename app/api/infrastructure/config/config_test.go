package config_test

import (
	"os"
	"testing"

	"github.com/konstellation-io/kdl-server/app/api/infrastructure/config"
	"github.com/stretchr/testify/suite"
)

type configTestSuite struct {
	suite.Suite
}

var _ suite.TestingSuite = &configTestSuite{}

var envs = map[string]string{
	"KDL_SERVER_PORT":                "port",
	"PROJECT_MLFLOW_URL":             "mlflow_url",
	"PROJECT_FILEBROWSER_URL":        "filebrowser_url",
	"RELEASE_NAME":                   "release_name",
	"KDL_SERVER_STATIC_FILES_PATH":   "static_files_path",
	"KDL_SERVER_MONGODB_URI":         "mongodb_uri",
	"KDL_SERVER_MONGODB_NAME":        "mongodb_name",
	"MINIO_ENDPOINT":                 "minio_endpoint",
	"MINIO_CONSOLE_ENDPOINT":         "console.min.io",
	"MINIO_ACCESS_KEY":               "minio_access_key",
	"KNOWLEDGE_GALAXY_ENABLED":       "true",
	"KNOWLEDGE_GALAXY_URL":           "knowledge_galaxy_url",
	"KUBECONFIG_DOWNLOAD_ENABLED":    "true",
	"KUBECONFIG_EXTERNAL_SERVER_URL": "external_server_url",
	"LABELS_COMMON_APP_RELEASE":      "app_release",
	"LABELS_COMMON_CHART_RELEASE":    "chart_release",
	"KEYCLOAK_ADMIN_USER":            "admin",
	"KEYCLOAK_PASSWORD_KEY":          "admin",
	"KEYCLOAK_ADMIN_CLIENT_ID":       "keycloak_client",
	"KEYCLOAK_MASTER_REALM":          "master_realm",
	"KEYCLOAK_REALM":                 "kdl",
	"KEYCLOAK_URL":                   "keycloak_url",
}

func TestConfigSuite(t *testing.T) {
	suite.Run(t, new(configTestSuite))
}

func (s *configTestSuite) TestConfig() {
	for k, v := range envs {
		_ = os.Setenv(k, v)
	}

	cfg := config.NewConfig()

	// Check the values
	s.Require().NotNil(cfg)
	s.Require().Equal("port", cfg.Port)
	s.Require().Equal("mlflow_url", cfg.ProjectMLFlowURL)
	s.Require().Equal("filebrowser_url", cfg.ProjectFilebrowserURL)
	s.Require().Equal("release_name", cfg.ReleaseName)
	s.Require().Equal("static_files_path", cfg.StaticFilesPath)
	s.Require().Equal("mongodb_uri", cfg.MongoDB.URI)
	s.Require().Equal("mongodb_name", cfg.MongoDB.DBName)
	s.Require().Equal("minio_endpoint", cfg.Minio.Endpoint)
	s.Require().Equal("console.min.io", cfg.Minio.ConsoleURL)
	s.Require().Equal("minio_access_key", cfg.Minio.AccessKey)
	s.Require().True(cfg.Kg.Enabled)
	s.Require().Equal("knowledge_galaxy_url", cfg.Kg.URL)
	s.Require().True(cfg.Kubeconfig.Enabled)
	s.Require().Equal("external_server_url", cfg.Kubeconfig.ExternalServerURL)
	s.Require().Equal("app_release", cfg.Labels.Common.AppRelease)
	s.Require().Equal("chart_release", cfg.Labels.Common.ChartRelease)
	s.Require().Equal("admin", cfg.Keycloak.AdminUser)
	s.Require().Equal("admin", cfg.Keycloak.AdminPasswordKey)
	s.Require().Equal("keycloak_client", cfg.Keycloak.AdminClientID)
	s.Require().Equal("master_realm", cfg.Keycloak.MasterRealm)
	s.Require().Equal("kdl", cfg.Keycloak.Realm)
	s.Require().Equal("keycloak_url", cfg.Keycloak.URL)

	// Unset the env vars
	for k := range envs {
		_ = os.Unsetenv(k)
	}
}

func (s *configTestSuite) TestConfig_MissingEnvironment() {
	defer func() {
		if r := recover(); r != nil {
			s.Require().NotNil(r)
		}
	}()

	// Call the function and expect it to panic
	config.NewConfig()
}

func (s *configTestSuite) TestConfig_KeycloakOptional() {
	for k, v := range envs {
		_ = os.Setenv(k, v)
	}

	// Unset the keycloak env vars
	_ = os.Unsetenv("KEYCLOAK_ADMIN_USER")
	_ = os.Unsetenv("KEYCLOAK_PASSWORD_KEY")
	_ = os.Unsetenv("KEYCLOAK_ADMIN_CLIENT_ID")
	_ = os.Unsetenv("KEYCLOAK_MASTER_REALM")
	_ = os.Unsetenv("KEYCLOAK_REALM")
	_ = os.Unsetenv("KEYCLOAK_URL")

	// Call the function and expect it to panic
	cfg := config.NewConfig()

	// Check the values
	s.Require().NotNil(cfg)
	s.Require().Equal("", cfg.Keycloak.AdminUser)
	s.Require().Equal("", cfg.Keycloak.AdminPasswordKey)
	s.Require().Equal("", cfg.Keycloak.AdminClientID)
	s.Require().Equal("", cfg.Keycloak.MasterRealm)
	s.Require().Equal("", cfg.Keycloak.Realm)
	s.Require().Equal("", cfg.Keycloak.URL)
}
