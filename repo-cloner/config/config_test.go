package config_test

import (
	"os"
	"testing"

	"github.com/konstellation-io/kdl-server/repo-cloner/config"
	"github.com/stretchr/testify/suite"
)

type configTestSuite struct {
	suite.Suite
}

var _ suite.TestingSuite = &configTestSuite{}

func TestConfigSuite(t *testing.T) {
	suite.Run(t, new(configTestSuite))
}

var mandatoryEnv = map[string]string{
	"KDL_SERVER_MONGODB_URI": "mongodb_uri",
	"KDL_USER_NAME":          "user_name",
}

var optionalEnv = map[string]string{
	"PEM_FILE_PASSWORD": "pem_file_password",
}

var defaultEnv = map[string]string{
	"DB_NAME":                 "db_name",
	"REPOS_PATH":              "repos_path",
	"PEM_FILE":                "pem_file",
	"CHECK_FREQUENCY_SECONDS": "20",
}

const (
	defaultMongoDBName = "kdl"
	defaultReposPath   = "/home/kdl/repos/"
	defaultPemFile     = "/home/kdl/.ssh/id_rsa"
	defaultCheckFreq   = 10
)

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
	s.Require().Equal(defaultMongoDBName, cfg.MongoDB.DBName)
	s.Require().Equal(defaultReposPath, cfg.ReposPath)
	s.Require().Equal(defaultPemFile, cfg.PemFile)
	s.Require().Equal(defaultCheckFreq, cfg.CheckFrequencySeconds)

	// Assert optional values
	s.Require().Empty(cfg.PemFilePassword)

	// Assert rest of values
	s.Require().Equal("mongodb_uri", cfg.MongoDB.URI)
	s.Require().Equal("user_name", cfg.UsrName)

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

	// Assert
	s.Require().NotNil(cfg)
	// Assert values
	s.Require().Equal("mongodb_uri", cfg.MongoDB.URI)
	s.Require().Equal("db_name", cfg.MongoDB.DBName)
	s.Require().Equal("user_name", cfg.UsrName)
	s.Require().Equal("repos_path", cfg.ReposPath)
	s.Require().Equal("pem_file", cfg.PemFile)
	s.Require().Equal("pem_file_password", cfg.PemFilePassword)
	s.Require().Equal(20, cfg.CheckFrequencySeconds)

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
