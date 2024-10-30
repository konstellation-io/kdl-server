package user

import (
	"testing"

	"github.com/go-logr/zapr"
	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/stretchr/testify/suite"
	"go.uber.org/zap"
)

type UsersSyncTestSuite struct {
	suite.Suite
	interactor *interactor
}

func TestUsersSyncTestSuite(t *testing.T) {
	suite.Run(t, new(UsersSyncTestSuite))
}

func (testSuite *UsersSyncTestSuite) SetupSuite() {
	zapLog, err := zap.NewDevelopment()
	testSuite.Require().NoError(err)
	logger := zapr.NewLogger(zapLog)

	testSuite.interactor = &interactor{
		logger: logger,
	}
}

func (testSuite *UsersSyncTestSuite) getUser(deleted bool) entity.User {
	return entity.User{
		ID:       "1",
		Email:    "test-1@test.com",
		Username: "test1",
		Deleted:  deleted,
	}
}

func (testSuite *UsersSyncTestSuite) TestInteractor_SyncGiteaUsersToUpdate_CreateNewUser_ExpectOk() {
	giteaUsers := []entity.User{
		testSuite.getUser(false),
	}
	kaiLabUsers := []entity.User{}

	usersToAdd, usersToRestore, usersEmailsToUpd, usernamesToUpd := testSuite.interactor.syncGiteaUsersToUpdate(kaiLabUsers, giteaUsers)

	testSuite.Assert().Len(usersToAdd, 1)
	testSuite.Assert().Contains(usersToAdd, testSuite.getUser(false))
	testSuite.Assert().Empty(usersToRestore)
	testSuite.Assert().Empty(usersEmailsToUpd)
	testSuite.Assert().Empty(usernamesToUpd)
}

func (testSuite *UsersSyncTestSuite) TestInteractor_SyncGiteaUsersToUpdate_RestoreUser_ExpectOk() {
	giteaUsers := []entity.User{
		testSuite.getUser(false),
	}

	kaiLabUsers := []entity.User{
		testSuite.getUser(true),
	}

	usersToAdd, usersToRestore, usersEmailsToUpd, usernamesToUpd := testSuite.interactor.syncGiteaUsersToUpdate(kaiLabUsers, giteaUsers)

	testSuite.Assert().Empty(usersToAdd)
	testSuite.Assert().Len(usersToRestore, 1)
	testSuite.Assert().Contains(usersToRestore, testSuite.getUser(false))
	testSuite.Assert().Empty(usersEmailsToUpd)
	testSuite.Assert().Empty(usernamesToUpd)
}

func (testSuite *UsersSyncTestSuite) TestInteractor_SyncGiteaUsersToUpdate_UpdateUserEmail_ExpectOk() {
	userToUpdate := entity.User{
		ID:       "1",
		Email:    "test-2@test.com",
		Username: "test1",
		Deleted:  false,
	}

	giteaUsers := []entity.User{
		userToUpdate,
	}
	kaiLabUsers := []entity.User{
		testSuite.getUser(false),
	}

	usersToAdd, usersToRestore, usersEmailsToUpd, usernamesToUpd := testSuite.interactor.syncGiteaUsersToUpdate(kaiLabUsers, giteaUsers)

	testSuite.Assert().Empty(usersToAdd)
	testSuite.Assert().Empty(usersToRestore)
	testSuite.Assert().Len(usersEmailsToUpd, 1)
	testSuite.Assert().Contains(usersEmailsToUpd, userToUpdate)
	testSuite.Assert().Empty(usernamesToUpd)
}

func (testSuite *UsersSyncTestSuite) TestInteractor_SyncGiteaUsersToUpdate_UpdateExistingUsername_ExpectOk() {
	userToUpdate := entity.User{
		ID:       "2",
		Email:    "test-1@test.com",
		Username: "test2",
		Deleted:  false,
	}

	giteaUsers := []entity.User{
		userToUpdate,
	}
	kaiLabUsers := []entity.User{
		testSuite.getUser(false),
	}

	usersToAdd, usersToRestore, usersEmailsToUpd, usernamesToUpd := testSuite.interactor.syncGiteaUsersToUpdate(kaiLabUsers, giteaUsers)

	testSuite.Assert().Empty(usersToAdd)
	testSuite.Assert().Empty(usersToRestore)
	testSuite.Assert().Empty(usersEmailsToUpd)
	testSuite.Require().Len(usernamesToUpd, 1)
	testSuite.Assert().Contains(usernamesToUpd, userToUpdate)
}

func (testSuite *UsersSyncTestSuite) TestInteractor_SyncGiteaUsersToUpdate_Delete_ExpectOk() {
	giteaUsers := []entity.User{
		{
			ID:       "2",
			Email:    "test-2@test.com",
			Username: "test2",
			Deleted:  false,
		},
	}
	kaiLabUsers := []entity.User{
		testSuite.getUser(false),
	}

	usersToDelete := testSuite.interactor.syncGiteaUsersToDelete(giteaUsers, kaiLabUsers)

	testSuite.Require().Len(usersToDelete, 1)
	testSuite.Assert().Contains(usersToDelete, testSuite.getUser(false))
}
