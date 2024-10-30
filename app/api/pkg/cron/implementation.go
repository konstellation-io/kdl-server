package cron

import (
	"time"

	"github.com/go-co-op/gocron"
	"github.com/go-logr/logr"
)

type SchedulerImpl struct {
	logger    logr.Logger
	scheduler *gocron.Scheduler
}

func NewScheduler(logger logr.Logger) Scheduler {
	scheduler := gocron.NewScheduler(time.UTC)

	return &SchedulerImpl{
		logger:    logger,
		scheduler: scheduler,
	}
}

func (s *SchedulerImpl) DoEvery(interval time.Duration, singletonMode bool, jobFun interface{}) (Job, error) {
	s.logger.Info("Starting scheduler", "secondsInterval", interval, "singletonMode", singletonMode)

	job, err := s.scheduler.Every(interval).Do(jobFun)
	if err != nil {
		return nil, err
	}

	if singletonMode {
		job.SingletonMode()
	}

	s.scheduler.StartAsync()

	return job, nil
}

func (s *SchedulerImpl) RunAll() {
	s.scheduler.RunAll()
}
