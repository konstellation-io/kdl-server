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

var mandatoryEnv = map[string]string{
	"PROJECT_MLFLOW_URL":             "mlflow_url",
	"PROJECT_FILEBROWSER_URL":        "filebrowser_url",
	"RELEASE_NAME":                   "release_name",
	"KDL_SERVER_MONGODB_URI":         "mongodb_uri",
	"MINIO_ENDPOINT":                 "minio_endpoint",
	"POD_NAMESPACE":                  "pod_namespace",
	"MINIO_CONSOLE_ENDPOINT":         "console.min.io",
	"MINIO_ACCESS_KEY":               "minio_access_key",
	"MINIO_SECRET_KEY":               "minio_secret_key",
	"KNOWLEDGE_GALAXY_URL":           "knowledge_galaxy_url",
	"KUBECONFIG_EXTERNAL_SERVER_URL": "external_server_url",
	"LABELS_COMMON_APP_RELEASE":      "app_release",
	"LABELS_COMMON_CHART_RELEASE":    "chart_release",
}

var optionalEnv = map[string]string{
	"KEYCLOAK_ADMIN_USER":      "admin",
	"KEYCLOAK_PASSWORD_KEY":    "admin",
	"KEYCLOAK_ADMIN_CLIENT_ID": "keycloak_client",
	"KEYCLOAK_MASTER_REALM":    "master_realm",
	"KEYCLOAK_REALM":           "kdl",
	"KEYCLOAK_URL":             "keycloak_url",
}

var defaultEnv = map[string]string{
	"KDL_SERVER_PORT":               "port",
	"KDL_SERVER_STATIC_FILES_PATH":  "static_files_path",
	"KDL_WATCHER_CONFIGMAP_ENABLED": "true",
	"KDL_SERVER_MONGODB_NAME":       "mongodb_name",
	"KNOWLEDGE_GALAXY_ENABLED":      "true",
	"KUBECONFIG_DOWNLOAD_ENABLED":   "true",
}

const (
	defaultPort            = "8080"
	defaultStaticFilesPath = "../public"
	defaultMongoDBName     = "kdl"
)

func TestConfigSuite(t *testing.T) {
	suite.Run(t, new(configTestSuite))
}

func (s *configTestSuite) setEnvVariables(envMap map[string]string) {
	for k, v := range envMap {
		_ = os.Setenv(k, v)
	}
}

func (s *configTestSuite) unsetEnvVariables(envMap map[string]string) {
	for k := range envMap {
		_ = os.Unsetenv(k)
	}
}

func (s *configTestSuite) TestConfig_MandatoryValues() {
	// Set mandatoryEnv vars
	s.setEnvVariables(mandatoryEnv)

	// Act
	cfg := config.NewConfig()

	// Assert
	s.Require().NotNil(cfg)
	// Assert default values
	s.Require().Equal(defaultPort, cfg.Port)
	s.Require().Equal(defaultStaticFilesPath, cfg.StaticFilesPath)
	s.Require().False(cfg.WatchConfigMap)
	s.Require().Equal(defaultMongoDBName, cfg.MongoDB.DBName)
	s.Require().False(cfg.Kg.Enabled)
	s.Require().False(cfg.Kubeconfig.Enabled)
	s.Require().True(cfg.Kubernetes.IsInsideCluster)

	// Assert optional values
	s.Require().Equal("", cfg.Keycloak.AdminUser)
	s.Require().Equal("", cfg.Keycloak.AdminPasswordKey)
	s.Require().Equal("", cfg.Keycloak.AdminClientID)
	s.Require().Equal("", cfg.Keycloak.MasterRealm)
	s.Require().Equal("", cfg.Keycloak.Realm)
	s.Require().Equal("", cfg.Keycloak.URL)

	// Assert mandatory values
	s.Require().Equal("mlflow_url", cfg.ProjectMLFlowURL)
	s.Require().Equal("filebrowser_url", cfg.ProjectFilebrowserURL)
	s.Require().Equal("release_name", cfg.ReleaseName)
	s.Require().Equal("mongodb_uri", cfg.MongoDB.URI)
	s.Require().Equal("pod_namespace", cfg.Kubernetes.Namespace)
	s.Require().Equal("minio_endpoint", cfg.Minio.Endpoint)
	s.Require().Equal("console.min.io", cfg.Minio.ConsoleURL)
	s.Require().Equal("minio_access_key", cfg.Minio.AccessKey)
	s.Require().Equal("minio_secret_key", cfg.Minio.SecretKey)
	s.Require().Equal("knowledge_galaxy_url", cfg.Kg.URL)
	s.Require().Equal("external_server_url", cfg.Kubeconfig.ExternalServerURL)
	s.Require().Equal("app_release", cfg.Labels.Common.AppRelease)
	s.Require().Equal("chart_release", cfg.Labels.Common.ChartRelease)

	// Unset the mandatoryEnv vars
	s.unsetEnvVariables(mandatoryEnv)
}

func (s *configTestSuite) TestConfig_SetAllValues() {
	// Set mandatoryEnv, defaultEnv and optionalEnv vars
	s.setEnvVariables(mandatoryEnv)
	s.setEnvVariables(defaultEnv)
	s.setEnvVariables(optionalEnv)

	// Act
	cfg := config.NewConfig()

	// Check the values
	s.Require().NotNil(cfg)
	// Assert values
	s.Require().Equal("port", cfg.Port)
	s.Require().Equal("mlflow_url", cfg.ProjectMLFlowURL)
	s.Require().Equal("filebrowser_url", cfg.ProjectFilebrowserURL)
	s.Require().Equal("release_name", cfg.ReleaseName)
	s.Require().Equal("static_files_path", cfg.StaticFilesPath)
	s.Require().True(cfg.WatchConfigMap)
	s.Require().Equal("mongodb_uri", cfg.MongoDB.URI)
	s.Require().Equal("mongodb_name", cfg.MongoDB.DBName)
	s.Require().Equal("pod_namespace", cfg.Kubernetes.Namespace)
	s.Require().Equal("minio_endpoint", cfg.Minio.Endpoint)
	s.Require().Equal("console.min.io", cfg.Minio.ConsoleURL)
	s.Require().Equal("minio_access_key", cfg.Minio.AccessKey)
	s.Require().Equal("minio_secret_key", cfg.Minio.SecretKey)
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

	// Unset the mandatoryEnv, defaultEnv and optionalEnv vars
	s.unsetEnvVariables(mandatoryEnv)
	s.unsetEnvVariables(defaultEnv)
	s.unsetEnvVariables(optionalEnv)
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

// func (s *configTestSuite) TestConfig_KeycloakOptional() {
// 	for k, v := range envs {
// 		_ = os.Setenv(k, v)
// 	}

// 	// Unset the keycloak env vars
// 	_ = os.Unsetenv("KEYCLOAK_ADMIN_USER")
// 	_ = os.Unsetenv("KEYCLOAK_PASSWORD_KEY")
// 	_ = os.Unsetenv("KEYCLOAK_ADMIN_CLIENT_ID")
// 	_ = os.Unsetenv("KEYCLOAK_MASTER_REALM")
// 	_ = os.Unsetenv("KEYCLOAK_REALM")
// 	_ = os.Unsetenv("KEYCLOAK_URL")

// 	// Call the function and expect it to panic
// 	cfg := config.NewConfig()

// 	// Check the values
// 	s.Require().NotNil(cfg)
// 	s.Require().Equal("", cfg.Keycloak.AdminUser)
// 	s.Require().Equal("", cfg.Keycloak.AdminPasswordKey)
// 	s.Require().Equal("", cfg.Keycloak.AdminClientID)
// 	s.Require().Equal("", cfg.Keycloak.MasterRealm)
// 	s.Require().Equal("", cfg.Keycloak.Realm)
// 	s.Require().Equal("", cfg.Keycloak.URL)
// }
