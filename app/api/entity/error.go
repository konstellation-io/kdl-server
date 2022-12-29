package entity

import (
	"errors"
	"fmt"
)

var (
	ErrProjectNotFound = errors.New("project not found")

	ErrUserNotFound = errors.New("user not found")

	ErrDuplicatedUser = errors.New("user is duplicated")

	ErrNotImplemented = fmt.Errorf("not implemented")

	ErrInvalidRepoType = fmt.Errorf("invalid repo type")

	ErrRuntimeNotFound = fmt.Errorf("runtime not found")

	ErrNoRunningRuntime = fmt.Errorf("no running runtime")

	ErrCapabilitiesNotFound = errors.New("capabilities not found")

	ErrCapabilitiesNotValid = errors.New("capabilities not valid")

	ErrCapabilitiesNoParameters = errors.New("capabilities must contain one of these values: nodeSelector, toleration, affinities")

	ErrCapabilitiesNoName = errors.New("capabilities must have a name")

	ErrCapabilitiesNoKey = errors.New("toleration has no key assigned")

	ErrCapabilitiesNoOperator = errors.New("toleration has no operator assigned")

	ErrCapabilitiesInvalidOperator = errors.New("the following value is not a valid toleration operator")

	ErrCapabilitiesNoValue = errors.New("toleration has no value assigned while operator being 'equal'")

	ErrCapabilitiesHasValue = errors.New("toleration has a value assigned while operator being 'exists'")

	ErrCapabilitiesNoEffect = errors.New("toleration has no effect assigned")

	ErrCapabilitiesInvalidEffect = errors.New("the following value is not a valid toleration effect")

	ErrCapabilitiesInvalidSeconds = errors.New("the following value is not a valid duration for toleration seconds")
)

func wrapCapabilitiesNotValidErr(err error) error {
	return fmt.Errorf("%s: %w", ErrCapabilitiesNotValid, err)
}

func wrapErrWithValue(err error, value string) error {
	return fmt.Errorf("%w: %s", err, value)
}
