package config

import (
	"log"
	"os"

	"github.com/kelseyhightower/envconfig"
	"gopkg.in/yaml.v3"
)

type Config struct {
	LogLevel        string `yaml:"logLevel" envconfig:"KDL_SERVER_LOG_LEVEL"`
	Port            string `yaml:"port" envconfig:"KDL_SERVER_PORT"`
	StaticFilesPath string `yaml:"staticFilesPath" envconfig:"KDL_SERVER_STATIC_FILES_PATH"`
	MongoDB         struct {
		URI    string `yaml:"uri" envconfig:"KDL_SERVER_MONGODB_URI"`
		DBName string `yaml:"dbName"`
	} `yaml:"mongodb"`
}

// NewConfig will read the config.yml file and override values with env vars.
func NewConfig() *Config {
	f, err := os.Open("config.yml")
	if err != nil {
		log.Fatalf("Error opening config.yml: %s", err)
	}

	cfg := &Config{}
	decoder := yaml.NewDecoder(f)

	err = decoder.Decode(cfg)
	if err != nil {
		log.Fatalf("Error loading config.yml: %s", err)
	}

	err = envconfig.Process("", cfg)
	if err != nil {
		panic(err)
	}

	return cfg
}
