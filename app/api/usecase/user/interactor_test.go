package user_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/giteaservice"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/k8s"
	"github.com/konstellation-io/kdl-server/app/api/pkg/clock"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
	"github.com/konstellation-io/kdl-server/app/api/pkg/sshhelper"
	"github.com/konstellation-io/kdl-server/app/api/usecase/user"
)

var errUnexpected = errors.New("some error")

type userSuite struct {
	ctrl       *gomock.Controller
	interactor user.UseCase
	mocks      userMocks
}

type userMocks struct {
	logger        *logging.MockLogger
	repo          *user.MockRepository
	sshGenerator  *sshhelper.MockSSHKeyGenerator
	clock         *clock.MockClock
	giteaService  *giteaservice.MockGiteaClient
	k8sClientMock *k8s.MockK8sClient
}

func newUserSuite(t *testing.T) *userSuite {
	ctrl := gomock.NewController(t)

	logger := logging.NewMockLogger(ctrl)
	logging.AddLoggerExpects(logger)

	repo := user.NewMockRepository(ctrl)

	clockMock := clock.NewMockClock(ctrl)
	sshGenerator := sshhelper.NewMockSSHKeyGenerator(ctrl)
	giteaServiceMock := giteaservice.NewMockGiteaClient(ctrl)
	k8sClientMock := k8s.NewMockK8sClient(ctrl)

	interactor := user.NewInteractor(logger, repo, sshGenerator, clockMock, giteaServiceMock, k8sClientMock)

	return &userSuite{
		ctrl:       ctrl,
		interactor: interactor,
		mocks: userMocks{
			logger:        logger,
			repo:          repo,
			sshGenerator:  sshGenerator,
			clock:         clockMock,
			giteaService:  giteaServiceMock,
			k8sClientMock: k8sClientMock,
		},
	}
}

func TestInteractor_Create(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	const (
		id            = "user.1234"
		email         = "user@email.com"
		password      = "p4$sword"
		username      = "john.doe"
		accessLevel   = entity.AccessLevelAdmin
		publicSSHKey  = "test-ssh-key-public"
		privateSSHKey = "test-ssh-key-private"
		secretName    = "john-doe-ssh-keys" //nolint:gosec // it is a unit test
	)

	secretValues := map[string]string{
		"KDL_USER_PUBLIC_SSH_KEY":  publicSSHKey,
		"KDL_USER_PRIVATE_SSH_KEY": privateSSHKey,
	}

	ctx := context.Background()
	now := time.Now().UTC()

	sshKey := entity.SSHKey{
		Public:       publicSSHKey,
		Private:      privateSSHKey,
		CreationDate: now,
	}

	u := entity.User{
		Username:     username,
		Email:        email,
		AccessLevel:  accessLevel,
		SSHKey:       sshKey,
		CreationDate: now,
	}

	expectedUser := entity.User{
		ID:           id,
		Username:     username,
		Email:        email,
		AccessLevel:  accessLevel,
		SSHKey:       sshKey,
		CreationDate: now,
	}

	s.mocks.repo.EXPECT().GetByUsername(ctx, username).Return(entity.User{}, entity.ErrUserNotFound)
	s.mocks.repo.EXPECT().GetByEmail(ctx, email).Return(entity.User{}, entity.ErrUserNotFound)
	s.mocks.clock.EXPECT().Now().Return(now)
	s.mocks.sshGenerator.EXPECT().NewKeys().Return(sshKey, nil)
	s.mocks.repo.EXPECT().Create(ctx, u).Return(id, nil)
	s.mocks.repo.EXPECT().Get(ctx, id).Return(expectedUser, nil)
	s.mocks.giteaService.EXPECT().CreateUser(email, username, password).Return(nil)
	s.mocks.giteaService.EXPECT().AddSSHKey(username, sshKey.Public).Return(nil)
	s.mocks.k8sClientMock.EXPECT().CreateSecret(secretName, secretValues)

	createdUser, err := s.interactor.Create(ctx, email, username, password, accessLevel)

	require.NoError(t, err)
	require.Equal(t, expectedUser, createdUser)
}

func TestInteractor_Create_UserDuplEmail(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	const (
		email       = "user@email.com"
		password    = "p4$sword"
		username    = "john"
		accessLevel = entity.AccessLevelAdmin
	)

	ctx := context.Background()

	s.mocks.repo.EXPECT().GetByUsername(ctx, username).Return(entity.User{}, entity.ErrUserNotFound)
	s.mocks.repo.EXPECT().GetByEmail(ctx, email).Return(entity.User{}, nil)

	createdUser, err := s.interactor.Create(ctx, email, username, password, accessLevel)
	require.Equal(t, createdUser, entity.User{})
	require.Equal(t, err, entity.ErrDuplicatedUser)
}

func TestInteractor_Create_UserDuplUsername(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	const (
		email       = "user@email.com"
		password    = "p4$sword"
		username    = "john"
		accessLevel = entity.AccessLevelAdmin
	)

	ctx := context.Background()

	s.mocks.repo.EXPECT().GetByUsername(ctx, username).Return(entity.User{}, nil)

	createdUser, err := s.interactor.Create(ctx, email, username, password, accessLevel)
	require.Equal(t, createdUser, entity.User{})
	require.Equal(t, err, entity.ErrDuplicatedUser)
}

func TestInteractor_AreToolsRunning(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	const (
		username         = "john"
		expectedResponse = true
	)

	s.mocks.k8sClientMock.EXPECT().IsUserToolPODRunning(username).Return(expectedResponse, nil)

	running, err := s.interactor.AreToolsRunning(username)

	require.NoError(t, err)
	require.Equal(t, expectedResponse, running)
}

// nolint:dupl // similar code but no equal
func TestInteractor_StopTools(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	const (
		username     = "john"
		toolsRunning = true
	)

	ctx := context.Background()
	expectedUser := entity.User{Username: username}

	s.mocks.repo.EXPECT().GetByUsername(ctx, username).Return(expectedUser, nil)
	s.mocks.k8sClientMock.EXPECT().IsUserToolPODRunning(username).Return(toolsRunning, nil)
	s.mocks.k8sClientMock.EXPECT().DeleteUserToolsCR(ctx, username).Return(nil)

	returnedUser, err := s.interactor.StopTools(ctx, username)

	require.NoError(t, err)
	require.Equal(t, expectedUser, returnedUser)
}

func TestInteractor_StopTools_Err(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	const (
		username     = "john"
		toolsRunning = false
	)

	ctx := context.Background()
	u := entity.User{Username: username}
	emptyUser := entity.User{}

	s.mocks.repo.EXPECT().GetByUsername(ctx, username).Return(u, nil)
	s.mocks.k8sClientMock.EXPECT().IsUserToolPODRunning(username).Return(toolsRunning, nil)

	returnedUser, err := s.interactor.StopTools(ctx, username)

	require.Equal(t, user.ErrStopUserTools, err)
	require.Equal(t, returnedUser, emptyUser)
}

// nolint:dupl // similar code but no equal
func TestInteractor_StartTools(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	const (
		username     = "john"
		toolsRunning = false
	)

	ctx := context.Background()
	expectedUser := entity.User{Username: username}

	s.mocks.repo.EXPECT().GetByUsername(ctx, username).Return(expectedUser, nil)
	s.mocks.k8sClientMock.EXPECT().IsUserToolPODRunning(username).Return(toolsRunning, nil)
	s.mocks.k8sClientMock.EXPECT().CreateUserToolsCR(ctx, username).Return(nil)

	returnedUser, err := s.interactor.StartTools(ctx, username)

	require.NoError(t, err)
	require.Equal(t, expectedUser, returnedUser)
}

func TestInteractor_StartTools_Err(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	const (
		username     = "john"
		toolsRunning = true
	)

	ctx := context.Background()
	u := entity.User{Username: username}
	emptyUser := entity.User{}

	s.mocks.repo.EXPECT().GetByUsername(ctx, username).Return(u, nil)
	s.mocks.k8sClientMock.EXPECT().IsUserToolPODRunning(username).Return(toolsRunning, nil)

	returnedUser, err := s.interactor.StartTools(ctx, username)

	require.Equal(t, user.ErrStartUserTools, err)
	require.Equal(t, returnedUser, emptyUser)
}

func TestInteractor_FindAll(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()
	expectedUsers := []entity.User{{Username: "john"}}

	s.mocks.repo.EXPECT().FindAll(ctx).Return(expectedUsers, nil)

	users, err := s.interactor.FindAll(ctx)

	require.NoError(t, err)
	require.Equal(t, expectedUsers, users)
}

func TestInteractor_FindAll_Err(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	var emptyUsers []entity.User

	someErr := errUnexpected
	ctx := context.Background()

	s.mocks.repo.EXPECT().FindAll(ctx).Return(emptyUsers, someErr)

	users, err := s.interactor.FindAll(ctx)

	require.Equal(t, someErr, err)
	require.Equal(t, emptyUsers, users)
}

func TestInteractor_GetByEmail(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	const email = "john@email.com"

	ctx := context.Background()
	expectedUser := entity.User{Username: "john"}

	s.mocks.repo.EXPECT().GetByEmail(ctx, email).Return(expectedUser, nil)

	u, err := s.interactor.GetByEmail(ctx, email)

	require.NoError(t, err)
	require.Equal(t, expectedUser, u)
}

func TestInteractor_GetByEmail_Err(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	const email = "john@email.com"

	ctx := context.Background()
	someErr := entity.ErrUserNotFound
	emptyUser := entity.User{}

	s.mocks.repo.EXPECT().GetByEmail(ctx, email).Return(emptyUser, someErr)

	u, err := s.interactor.GetByEmail(ctx, email)

	require.Equal(t, someErr, err)
	require.Equal(t, emptyUser, u)
}

func TestInteractor_FindByIDs(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()
	expectedUsers := []entity.User{{Username: "john"}}

	userIDs := []string{"userA", "userB"}

	s.mocks.repo.EXPECT().FindByIDs(ctx, userIDs).Return(expectedUsers, nil)

	users, err := s.interactor.FindByIDs(ctx, userIDs)

	require.NoError(t, err)
	require.Equal(t, expectedUsers, users)
}

func TestInteractor_GetByID(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()
	expectedUser := entity.User{Username: "john"}

	userID := "userA"

	s.mocks.repo.EXPECT().Get(ctx, userID).Return(expectedUser, nil)

	users, err := s.interactor.GetByID(ctx, userID)

	require.NoError(t, err)
	require.Equal(t, expectedUser, users)
}

func TestInteractor_RegenerateSSHKeys(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	const (
		id            = "user.1234"
		email         = "user@email.com"
		username      = "john.doe"
		accessLevel   = entity.AccessLevelAdmin
		publicSSHKey  = "test-ssh-key-public"
		privateSSHKey = "test-ssh-key-private"
		secretName    = "john-doe-ssh-keys" //nolint:gosec // it is a unit test
	)

	secretValues := map[string]string{
		"KDL_USER_PUBLIC_SSH_KEY":  publicSSHKey,
		"KDL_USER_PRIVATE_SSH_KEY": privateSSHKey,
	}

	ctx := context.Background()
	now := time.Now().UTC()

	sshKey := entity.SSHKey{
		Public:       publicSSHKey,
		Private:      privateSSHKey,
		CreationDate: now,
	}

	targetUser := entity.User{
		ID:           id,
		Username:     username,
		Email:        email,
		AccessLevel:  accessLevel,
		SSHKey:       sshKey,
		CreationDate: now,
	}

	s.mocks.k8sClientMock.EXPECT().IsUserToolPODRunning(username).Return(false, nil)
	s.mocks.sshGenerator.EXPECT().NewKeys().Return(sshKey, nil)
	s.mocks.k8sClientMock.EXPECT().UpdateSecret(secretName, secretValues).Return(nil)
	s.mocks.giteaService.EXPECT().UpdateSSHKey(username, sshKey.Public).Return(nil)
	s.mocks.repo.EXPECT().UpdateSSHKey(ctx, username, sshKey).Return(nil)
	s.mocks.repo.EXPECT().GetByUsername(ctx, username).Return(targetUser, nil).AnyTimes()

	userData, err := s.interactor.RegenerateSSHKeys(ctx, targetUser)

	require.NoError(t, err)
	require.Equal(t, targetUser, userData)
}

func TestInteractor_RegenerateSSHKeys_UserToolsRunning(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	const (
		id            = "user.1234"
		email         = "user@email.com"
		username      = "john.doe"
		accessLevel   = entity.AccessLevelAdmin
		publicSSHKey  = "test-ssh-key-public"
		privateSSHKey = "test-ssh-key-private"
		secretName    = "john-doe-ssh-keys" //nolint:gosec // it is a unit test
	)

	ctx := context.Background()
	now := time.Now().UTC()

	sshKey := entity.SSHKey{
		Public:       publicSSHKey,
		Private:      privateSSHKey,
		CreationDate: now,
	}

	targetUser := entity.User{
		ID:           id,
		Username:     username,
		Email:        email,
		AccessLevel:  accessLevel,
		SSHKey:       sshKey,
		CreationDate: now,
	}

	s.mocks.k8sClientMock.EXPECT().IsUserToolPODRunning(username).Return(true, nil)
	userData, err := s.interactor.RegenerateSSHKeys(ctx, targetUser)

	require.Equal(t, userData, entity.User{})
	require.Equal(t, err, user.ErrUserToolsActive)
}

func TestInteractor_UpdateAccessLevel(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	const (
		id          = "user.1234"
		username    = "john.doe"
		accessLevel = entity.AccessLevelAdmin
	)

	ctx := context.Background()

	targetUser := entity.User{
		ID:          id,
		Username:    username,
		AccessLevel: accessLevel,
	}

	ids := []string{id}
	users := []entity.User{targetUser}

	s.mocks.repo.EXPECT().UpdateAccessLevel(ctx, ids, accessLevel).Return(nil)
	s.mocks.repo.EXPECT().FindByIDs(ctx, ids).Return(users, nil)

	returnedUsers, err := s.interactor.UpdateAccessLevel(ctx, ids, accessLevel)

	require.NoError(t, err)
	require.Equal(t, users, returnedUsers)
}
