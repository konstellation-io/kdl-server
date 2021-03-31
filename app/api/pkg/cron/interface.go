package cron

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

import (
	"time"
)

type Scheduler interface {
	DoEvery(interval time.Duration, singletonMode bool, jobFun interface{}) (Job, error)
	RunAll()
}

type Job interface {
	LastRun() time.Time
	RunCount() int
	NextRun() time.Time
}
