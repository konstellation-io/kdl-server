package config

import (
	"errors"
	"fmt"
	"reflect"

	"github.com/kelseyhightower/envconfig"
)

var (
	errFieldEmpty = errors.New("cannot be empty")
	errNilStruct  = errors.New("struct is nil")
	errValidation = errors.New("validation error")
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
	return validateStruct(reflect.ValueOf(c).Elem())
}

func validateStruct(v reflect.Value) error {
	if v.Kind() == reflect.Ptr {
		if v.IsNil() {
			return errNilStruct
		}

		v = v.Elem()
	}

	if v.Kind() != reflect.Struct {
		return nil
	}

	for i := 0; i < v.NumField(); i++ {
		field := v.Field(i)
		fieldType := v.Type().Field(i)

		if err := validateField(field, fieldType); err != nil {
			return fmt.Errorf("%w: field %s", errValidation, fieldType.Name)
		}
	}

	return nil
}

func validateField(field reflect.Value, fieldType reflect.StructField) error {
	// check if the field is a struct and call validateStruct recursively
	if field.Kind() == reflect.Struct {
		if err := validateStruct(field); err != nil {
			return fmt.Errorf("error in field %s: %w", fieldType.Name, err)
		}

		return nil
	}
	// optional field, continue
	if fieldType.Tag.Get("optional") == "true" {
		return nil
	}

	// check if the field is a bool, if so, continue
	if field.Kind() == reflect.Bool {
		return nil
	}

	if reflect.DeepEqual(field.Interface(), reflect.Zero(field.Type()).Interface()) {
		// return error if field is empty
		return fmt.Errorf("%w: %s", errFieldEmpty, fieldType.Name)
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
