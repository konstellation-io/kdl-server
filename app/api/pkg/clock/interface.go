package clock

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

import "time"

type Clock interface {
	Now() time.Time
}
