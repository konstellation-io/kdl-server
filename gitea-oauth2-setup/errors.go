package main

import "errors"

var ErrMissingEnvValue = errors.New("missing value for environment variable")
var ErrTimeout = errors.New("timeout")
