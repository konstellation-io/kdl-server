package clock

import (
	"time"
)

type realClock struct{}

// NewRealClock is a constructor function.
func NewRealClock() Clock {
	return &realClock{}
}

// Now returns the current UTC time.
func (r *realClock) Now() time.Time {
	return time.Now().UTC()
}
