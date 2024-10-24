package entity

import (
	"time"
)

type UserActivityType string

const (
	UserActivityTypeDeleteProject UserActivityType = "DELETE_PROJECT"
)

func (e UserActivityType) IsValid() bool {
	return e == UserActivityTypeDeleteProject
}

func (e UserActivityType) String() string {
	return string(e)
}

type UserActivityVar struct {
	Key   string
	Value string
}

func NewActivityVarsDeleteRepo(projectID, minioBackupBucket string) []UserActivityVar {
	return []UserActivityVar{
		{
			Key:   "PROJECT_ID",
			Value: projectID,
		},
		{
			Key:   "MINIO_BACKUP_BUCKET",
			Value: minioBackupBucket,
		},
	}
}

type UserActivity struct {
	Date   time.Time
	UserID string
	Type   UserActivityType
	Vars   []UserActivityVar
}

func NewUserActivity(
	date time.Time,
	userID string,
	activityType UserActivityType,
	vars []UserActivityVar,
) UserActivity {
	return UserActivity{
		Date:   date,
		UserID: userID,
		Type:   activityType,
		Vars:   vars,
	}
}
