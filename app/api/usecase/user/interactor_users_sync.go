package user

import (
	"context"
	"sync"
	"time"

	"github.com/konstellation-io/kdl-server/app/api/entity"
)

// ScheduleUsersSyncJob creates a cron job to synchronize the users database with Gitea every interval.
func (i *interactor) ScheduleUsersSyncJob(interval time.Duration) error {
	_, err := i.scheduler.DoEvery(interval, true, i.syncUsers)

	if err != nil {
		return err
	}

	i.logger.Infof("Cron job for users sync running every %s", interval)

	return nil
}

// RunSyncUsersCronJob executes the job created inside the scheduler taking into account if there is a current execution
// because the job is created in singleton mode.
func (i *interactor) RunSyncUsersCronJob() {
	i.logger.Info("Running users sync job")
	i.scheduler.RunAll()
}

// syncUsers synchronizes the server users with Gitea. Creates the new users or deletes the missing ones also synchronizes the user emails.
func (i *interactor) syncUsers() {
	i.logger.Debug("User synchronization starting")

	ctx := context.Background()

	users, err := i.repo.FindAll(ctx, true)
	if err != nil {
		i.logger.Errorf("Error getting users from database: %s", err)
		return
	}

	usersMap := i.userListToMap(users)

	giteaUsers, err := i.giteaService.FindAllUsers()
	if err != nil {
		i.logger.Errorf("Error getting users from Gitea: %s", err)
		return
	}

	giteaUsersMap := i.userListToMap(giteaUsers)

	//nolint:prealloc // the final slice length is unknown
	var (
		usersToUpd     []entity.User
		usersToAdd     []entity.User
		usersToDel     []entity.User
		usersToRestore []entity.User
	)

	// Get the users to update or to add
	for _, giteaUser := range giteaUsers {
		if u, found := usersMap[giteaUser.Username]; found {
			if u.Deleted {
				i.logger.Debugf("The gitea user \"%s\" has been restored", u.Username)

				usersToRestore = append(usersToRestore, giteaUser)
			}

			if u.Email != giteaUser.Email {
				i.logger.Debugf("The gitea user \"%s\" has changed their email", u.Username)

				usersToUpd = append(usersToUpd, giteaUser)
			}

			continue
		}

		i.logger.Debugf("The gitea user \"%s\" is a new user", giteaUser.Username)
		usersToAdd = append(usersToAdd, giteaUser)
	}

	// Get the users to delete
	for _, u := range users {
		if u.Deleted {
			continue
		}

		if _, found := giteaUsersMap[u.Username]; found {
			continue
		}

		i.logger.Debugf("The gitea user \"%s\" has been deleted", u.Username)
		usersToDel = append(usersToDel, u)
	}

	var wg sync.WaitGroup

	i.syncDelUsers(ctx, usersToDel, &wg)
	i.syncRestoreUsers(ctx, usersToRestore, &wg)
	i.syncUpdateUsers(ctx, usersToUpd, &wg)
	i.syncAddUsers(ctx, usersToAdd, &wg)

	wg.Wait()

	i.logger.Debug("User synchronization finished correctly")
}

func (i *interactor) syncAddUsers(ctx context.Context, users []entity.User, wg *sync.WaitGroup) {
	for _, u := range users {
		wg.Add(1)

		go func(userToAdd entity.User) {
			defer wg.Done()

			_, err := i.Create(ctx, userToAdd.Email, userToAdd.Username, entity.AccessLevelViewer)
			if err != nil {
				i.logger.Errorf("Error creating user \"%s\": %s", userToAdd.Username, err)
			}
		}(u)
	}
}

func (i *interactor) syncUpdateUsers(ctx context.Context, users []entity.User, wg *sync.WaitGroup) {
	for _, u := range users {
		wg.Add(1)

		go func(userToUpd entity.User) {
			defer wg.Done()

			err := i.repo.UpdateEmail(ctx, userToUpd.Username, userToUpd.Email)
			if err != nil {
				i.logger.Errorf("Error updating user \"%s\": %s", userToUpd.Username, err)
			}
		}(u)
	}
}

func (i *interactor) syncDelUsers(ctx context.Context, users []entity.User, wg *sync.WaitGroup) {
	for _, u := range users {
		wg.Add(1)

		go func(userToDel entity.User) {
			defer wg.Done()

			err := i.repo.UpdateDeleted(ctx, userToDel.Username, true)
			if err != nil {
				i.logger.Errorf("Error marking as deleted user \"%s\": %s", userToDel.Username, err)
			}
		}(u)
	}
}

func (i *interactor) syncRestoreUsers(ctx context.Context, users []entity.User, wg *sync.WaitGroup) {
	for _, u := range users {
		wg.Add(1)

		go func(userToRestore entity.User) {
			defer wg.Done()

			err := i.repo.UpdateDeleted(ctx, userToRestore.Username, false)
			if err != nil {
				i.logger.Errorf("Error restoring user \"%s\": %s", userToRestore.Username, err)
			}
		}(u)
	}
}

func (i *interactor) userListToMap(users []entity.User) map[string]entity.User {
	usersMap := map[string]entity.User{}

	for _, u := range users {
		usersMap[u.Username] = u
	}

	return usersMap
}
