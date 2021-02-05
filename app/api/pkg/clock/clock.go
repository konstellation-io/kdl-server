package clock

import (
	"time"
)

type RealClock struct {
}

func NewRealClock() Clock {
	return &RealClock{}
}

func (r *RealClock) Now() time.Time {
	return time.Now().UTC()
}
