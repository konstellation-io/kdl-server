package cron

import (
	"time"

	"github.com/go-co-op/gocron"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
)

type SchedulerImpl struct {
	logger    logging.Logger
	scheduler *gocron.Scheduler
}

func NewScheduler(logger logging.Logger) Scheduler {
	scheduler := gocron.NewScheduler(time.UTC)

	return &SchedulerImpl{
		logger:    logger,
		scheduler: scheduler,
	}
}

func (s *SchedulerImpl) DoEvery(interval time.Duration, singletonMode bool, jobFun interface{}) (Job, error) {
	s.logger.Debugf("Starting scheduler every %s, singleton mode = %t", interval, singletonMode)

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
