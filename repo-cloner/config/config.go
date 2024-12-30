package config

import (
	"fmt"
	"reflect"

	"github.com/kelseyhightower/envconfig"
)

// Config holds the configuration values of the application.
type Config struct {
	MongoDB struct {
		URI    string `envconfig:"KDL_SERVER_MONGODB_URI"`
		DBName string `envconfig:"DB_NAME"`
	}
	UsrName               string `envconfig:"KDL_USER_NAME"`
	ReposPath             string `envconfig:"REPOS_PATH"`
	PemFile               string `envconfig:"PEM_FILE"`
	PemFilePassword       string `envconfig:"PEM_FILE_PASSWORD"`
	CheckFrequencySeconds int    `envconfig:"CHECK_FREQUENCY_SECONDS"`
}

// NewConfig will read the config.yml file and override values with env vars.
func NewConfig() Config {
	cfg := Config{}

	err := envconfig.Process("", &cfg)
	if err != nil {
		panic(err)
	}

	v := reflect.ValueOf(cfg)
	for i := 0; i < v.NumField(); i++ {
		field := v.Field(i)
		if field.Interface() == reflect.Zero(field.Type()).Interface() {
			panic(fmt.Sprintf("field %s cannot be empty", v.Type().Field(i).Name))
		}
	}

	return cfg
}
