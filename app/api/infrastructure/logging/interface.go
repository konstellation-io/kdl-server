package logging

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=logging

import "github.com/konstellation-io/kre/libs/simplelogger"

// Logger defines how to logging in the application.
type Logger interface {
	simplelogger.SimpleLoggerInterface
}
