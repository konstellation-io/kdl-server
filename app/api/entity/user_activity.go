package entity

import (
	"slices"
	"time"
)

type UserActivityType string

const (
	UserActivityTypeCreateUser               UserActivityType = "CREATE_USER"
	UserActivityTypeUpdateUserAccessLevel    UserActivityType = "UPDATE_USER_ACCESS_LEVEL"
	UserActivityTypeDeleteProject            UserActivityType = "DELETE_PROJECT"
	UserActivityTypeAddMember                UserActivityType = "ADD_MEMBER"
	UserActivityTypeRemoveMember             UserActivityType = "REMOVE_MEMBER"
	UserActivityTypeUpdateProjectName        UserActivityType = "UPDATE_PROJECT_NAME"
	UserActivityTypeUpdateProjectDescription UserActivityType = "UPDATE_PROJECT_DESCRIPTION"
	UserActivityTypeUpdateProjectArchived    UserActivityType = "UPDATE_PROJECT_ARCHIVED"
)

func (e UserActivityType) IsValid() bool {
	userActivityTypes := []UserActivityType{
		UserActivityTypeCreateUser,
		UserActivityTypeUpdateUserAccessLevel,
		UserActivityTypeDeleteProject,
		UserActivityTypeAddMember,
		UserActivityTypeRemoveMember,
		UserActivityTypeUpdateProjectName,
		UserActivityTypeUpdateProjectDescription,
		UserActivityTypeUpdateProjectArchived,
	}

	return slices.Contains(userActivityTypes, e)
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

func NewActivityVarsWithProjectAndUserID(projectID, userID string) []UserActivityVar {
	return []UserActivityVar{
		{
			Key:   "PROJECT_ID",
			Value: projectID,
		},
		{
			Key:   "USER_ID",
			Value: userID,
		},
	}
}

func NewActivityVarsWithUserID(userID string) []UserActivityVar {
	return []UserActivityVar{
		{
			Key:   "USER_ID",
			Value: userID,
		},
	}
}

func NewActivityVarsUpdateUserAccessLevel(projectID, userID, oldAccessLevel, newAccessLevel string) []UserActivityVar {
	return []UserActivityVar{
		{
			Key:   "PROJECT_ID",
			Value: projectID,
		},
		{
			Key:   "USER_ID",
			Value: userID,
		},
		{
			Key:   "OLD_ACCESS_LEVEL",
			Value: oldAccessLevel,
		},
		{
			Key:   "NEW_ACCESS_LEVEL",
			Value: newAccessLevel,
		},
	}
}

func NewActivityVarsUpdateProjectInfo(projectID, oldValue, newValue string) []UserActivityVar {
	return []UserActivityVar{
		{
			Key:   "PROJECT_ID",
			Value: projectID,
		},
		{
			Key:   "OLD_VALUE",
			Value: oldValue,
		},
		{
			Key:   "NEW_VALUE",
			Value: newValue,
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
