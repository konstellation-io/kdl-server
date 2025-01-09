package config

import (
	"errors"
	"fmt"
	"reflect"

	"github.com/kelseyhightower/envconfig"
)

var (
	errFieldEmpty = errors.New("cannot be empty")
)

// Config holds the configuration values of the application.
type Config struct {
	MongoDB struct {
		URI    string `envconfig:"KDL_SERVER_MONGODB_URI"`
		DBName string `envconfig:"DB_NAME" default:"kdl"`
	}
	UsrName               string `envconfig:"KDL_USER_NAME"`
	ReposPath             string `envconfig:"REPOS_PATH" default:"/home/kdl/repos/"`
	PemFile               string `envconfig:"PEM_FILE" default:"/home/kdl/.ssh/id_rsa"`
	PemFilePassword       string `envconfig:"PEM_FILE_PASSWORD" optional:"true"`
	CheckFrequencySeconds int    `envconfig:"CHECK_FREQUENCY_SECONDS" default:"10"`
}

func (c *Config) Validate() error {
	v := reflect.ValueOf(*c)
	t := reflect.TypeOf(*c)

	for i := 0; i < v.NumField(); i++ {
		fieldType := t.Field(i)

		optionalTag := fieldType.Tag.Get("optional")
		if optionalTag == "true" {
			continue
		}

		field := v.Field(i)
		if field.Interface() == reflect.Zero(field.Type()).Interface() {
			return fmt.Errorf("error in field %s: %w cannot be empty", v.Type().Field(i).Name, errFieldEmpty)
		}
	}

	return nil
}

// NewConfig will read the values from env vars.
func NewConfig() Config {
	cfg := Config{}

	err := envconfig.Process("", &cfg)
	if err != nil {
		panic(err)
	}

	err = cfg.Validate()
	if err != nil {
		panic(err)
	}

	return cfg
}
