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

	giteaUsers, err := i.giteaService.FindAllUsers()
	if err != nil {
		i.logger.Errorf("Error getting users from Gitea: %s", err)
		return
	}

	usersToAdd, usersToRestore, usersEmailsToUpd, usernamesToUpd := i.syncGiteaUsersToUpdate(users, giteaUsers)

	usersToDel := i.syncGiteaUsersToDelete(giteaUsers, users)

	var wg sync.WaitGroup

	i.syncDelUsers(ctx, usersToDel, &wg)
	i.syncRestoreUsers(ctx, usersToRestore, &wg)
	i.syncUpdateUserEmails(ctx, usersEmailsToUpd, &wg)
	i.syncUpdateUsernames(ctx, usernamesToUpd, &wg)
	i.syncAddUsers(ctx, usersToAdd, &wg)

	wg.Wait()

	i.logger.Debug("User synchronization finished correctly")
}

func (i *interactor) syncGiteaUsersToDelete(giteaUsers, users []entity.User) (usersToDel []entity.User) {
	giteaUsersMap := i.userListToMap(giteaUsers)
	giteaEmailsMap := i.userEmailListToMap(giteaUsers)

	for _, u := range users {
		if u.Deleted {
			continue
		}

		_, usernameExists := giteaUsersMap[u.Username]
		_, emailExists := giteaEmailsMap[u.Email]

		if usernameExists || emailExists {
			continue
		}

		i.logger.Debugf("The gitea user %q has been deleted", u.Username)
		usersToDel = append(usersToDel, u)
	}

	return usersToDel
}

func (i *interactor) syncGiteaUsersToUpdate(users, giteaUsers []entity.User) (usersToAdd,
	usersToRestore, usersEmailsToUpd, usernamesToUpd []entity.User) {
	usersMap := i.userListToMap(users)
	emailsMap := i.userEmailListToMap(users)

	for _, giteaUser := range giteaUsers {
		u, userFound := usersMap[giteaUser.Username]
		_, emailFound := emailsMap[giteaUser.Email]

		toBeCreated := !userFound && !emailFound

		toBeUpdated := !toBeCreated

		toBeRestored := toBeUpdated && u.Deleted

		switch {
		case toBeCreated:
			i.logger.Debugf("The gitea user %q with email %q is a new user", giteaUser.Username, giteaUser.Email)

			usersToAdd = append(usersToAdd, giteaUser)

		case toBeRestored:
			i.logger.Debugf("The gitea user %q has been restored", u.Username)

			usersToRestore = append(usersToRestore, giteaUser)

		case toBeUpdated && userFound:
			i.logger.Debugf("The gitea user %q has changed their email", u.Username)

			usersEmailsToUpd = append(usersEmailsToUpd, giteaUser)

		case toBeUpdated && !userFound:
			i.logger.Debugf("The gitea user with email %q has changed their username", u.Email)

			usernamesToUpd = append(usernamesToUpd, giteaUser)
		}
	}
	return usersToAdd, usersToRestore, usersEmailsToUpd, usernamesToUpd
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

func (i *interactor) syncUpdateUserEmails(ctx context.Context, users []entity.User, wg *sync.WaitGroup) {
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

func (i *interactor) syncUpdateUsernames(ctx context.Context, users []entity.User, wg *sync.WaitGroup) {
	for _, u := range users {
		wg.Add(1)

		go func(userToUpd entity.User) {
			defer wg.Done()

			err := i.repo.UpdateUsername(ctx, userToUpd.Email, userToUpd.Username)
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

// syncRestoreUsers restores the SSH key in Gitea and updates the user deleted flag in the DB.
func (i *interactor) syncRestoreUsers(ctx context.Context, users []entity.User, wg *sync.WaitGroup) {
	for _, u := range users {
		wg.Add(1)

		go func(userToRestore entity.User) {
			defer wg.Done()

			// Get the user SSH public key from k8s secret
			publicKey, err := i.k8sClient.GetUserSSHKeyPublic(ctx, userToRestore.UsernameSlug())
			if err != nil {
				i.logger.Errorf("Error getting the public SSH key for user \"%s\": %s", userToRestore.Username, err)
			}

			// Upload the SSH public key to Gitea
			err = i.giteaService.AddSSHKey(userToRestore.Username, string(publicKey))
			if err != nil {
				i.logger.Errorf("Error restoring SSH key for user \"%s\": %s", userToRestore.Username, err)
			}

			// Update deleted user field
			err = i.repo.UpdateDeleted(ctx, userToRestore.Username, false)
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

func (i *interactor) userEmailListToMap(users []entity.User) map[string]entity.User {
	usersMap := map[string]entity.User{}

	for _, u := range users {
		usersMap[u.Email] = u
	}

	return usersMap
}
