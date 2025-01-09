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

func (s *configTestSuite) TestConfig() {
	// Set the env vars
	var envs = map[string]string{
		"KDL_SERVER_MONGODB_URI":  "mongodb_uri",
		"DB_NAME":                 "db_name",
		"KDL_USER_NAME":           "user_name",
		"REPOS_PATH":              "repos_path",
		"PEM_FILE":                "pem_file",
		"PEM_FILE_PASSWORD":       "pem_file_password",
		"CHECK_FREQUENCY_SECONDS": "20",
	}

	for k, v := range envs {
		_ = os.Setenv(k, v)
	}

	cfg := config.NewConfig()

	// Check the values
	s.Require().NotNil(cfg)
	s.Require().Equal("mongodb_uri", cfg.MongoDB.URI)
	s.Require().Equal("db_name", cfg.MongoDB.DBName)
	s.Require().Equal("user_name", cfg.UsrName)
	s.Require().Equal("repos_path", cfg.ReposPath)
	s.Require().Equal("pem_file", cfg.PemFile)
	s.Require().Equal("pem_file_password", cfg.PemFilePassword)
	s.Require().Equal(20, cfg.CheckFrequencySeconds)

	// Unset the env vars
	for k := range envs {
		_ = os.Unsetenv(k)
	}
}

func (s *configTestSuite) TestConfig_DefaultOptionalValues() {
	// Set the env vars without a default values or not optional
	var envs = map[string]string{
		"KDL_SERVER_MONGODB_URI": "mongodb_uri",
		"KDL_USER_NAME":          "user_name",
	}

	for k, v := range envs {
		_ = os.Setenv(k, v)
	}

	cfg := config.NewConfig()

	// Check the values
	s.Require().NotNil(cfg)
	s.Require().Equal("mongodb_uri", cfg.MongoDB.URI)
	s.Require().Equal("kdl", cfg.MongoDB.DBName)
	s.Require().Equal("user_name", cfg.UsrName)
	s.Require().Equal("/home/kdl/repos/", cfg.ReposPath)
	s.Require().Equal("/home/kdl/.ssh/id_rsa", cfg.PemFile)
	s.Require().Equal("", cfg.PemFilePassword)
	s.Require().Equal(10, cfg.CheckFrequencySeconds)

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
