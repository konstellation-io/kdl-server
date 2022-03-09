package user_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/gosimple/slug"

	"github.com/konstellation-io/kdl-server/app/api/infrastructure/config"
	"github.com/konstellation-io/kdl-server/app/api/usecase/runtime"

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
	cfg           config.Config
	repo          *user.MockRepository
	runtimeRepo   *runtime.MockRepository
	sshGenerator  *sshhelper.MockSSHKeyGenerator
	clock         *clock.MockClock
	giteaService  *giteaservice.MockGiteaClient
	k8sClientMock *k8s.MockClient
}

func newUserSuite(t *testing.T, cfg *config.Config) *userSuite {
	ctrl := gomock.NewController(t)
	logger := logging.NewMockLogger(ctrl)
	repo := user.NewMockRepository(ctrl)
	repoRuntimes := runtime.NewMockRepository(ctrl)
	clockMock := clock.NewMockClock(ctrl)
	sshGenerator := sshhelper.NewMockSSHKeyGenerator(ctrl)
	giteaServiceMock := giteaservice.NewMockGiteaClient(ctrl)
	k8sClientMock := k8s.NewMockClient(ctrl)

	logging.AddLoggerExpects(logger)

	if cfg == nil {
		cfg = &config.Config{}
	}

	interactor := user.NewInteractor(logger, *cfg, repo, repoRuntimes, sshGenerator, clockMock, giteaServiceMock, k8sClientMock)

	return &userSuite{
		ctrl:       ctrl,
		interactor: interactor,
		mocks: userMocks{
			logger:        logger,
			cfg:           *cfg,
			repo:          repo,
			runtimeRepo:   repoRuntimes,
			sshGenerator:  sshGenerator,
			clock:         clockMock,
			giteaService:  giteaServiceMock,
			k8sClientMock: k8sClientMock,
		},
	}
}

func TestInteractor_Create(t *testing.T) {
	s := newUserSuite(t, nil)
	defer s.ctrl.Finish()

	const (
		id            = "user.1234"
		email         = "user@email.com"
		username      = "john.doe"
		accessLevel   = entity.AccessLevelAdmin
		publicSSHKey  = "test-ssh-key-public"
		privateSSHKey = "test-ssh-key-private"
	)

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
	s.mocks.giteaService.EXPECT().AddSSHKey(username, sshKey.Public).Return(nil)
	s.mocks.k8sClientMock.EXPECT().CreateUserSSHKeySecret(ctx, u, publicSSHKey, privateSSHKey)
	s.mocks.k8sClientMock.EXPECT().CreateUserServiceAccount(ctx, u.UsernameSlug())

	createdUser, err := s.interactor.Create(ctx, email, username, accessLevel)

	require.NoError(t, err)
	require.Equal(t, expectedUser, createdUser)
}

func TestInteractor_Create_UserDuplEmail(t *testing.T) {
	s := newUserSuite(t, nil)
	defer s.ctrl.Finish()

	const (
		email       = "user@email.com"
		username    = "john"
		accessLevel = entity.AccessLevelAdmin
	)

	ctx := context.Background()

	s.mocks.repo.EXPECT().GetByUsername(ctx, username).Return(entity.User{}, entity.ErrUserNotFound)
	s.mocks.repo.EXPECT().GetByEmail(ctx, email).Return(entity.User{}, nil)

	createdUser, err := s.interactor.Create(ctx, email, username, accessLevel)
	require.Equal(t, createdUser, entity.User{})
	require.Equal(t, err, entity.ErrDuplicatedUser)
}

func TestInteractor_Create_UserDuplUsername(t *testing.T) {
	s := newUserSuite(t, nil)
	defer s.ctrl.Finish()

	const (
		email       = "user@email.com"
		username    = "john"
		accessLevel = entity.AccessLevelAdmin
	)

	ctx := context.Background()

	s.mocks.repo.EXPECT().GetByUsername(ctx, username).Return(entity.User{}, nil)

	createdUser, err := s.interactor.Create(ctx, email, username, accessLevel)
	require.Equal(t, createdUser, entity.User{})
	require.Equal(t, err, entity.ErrDuplicatedUser)
}

func TestInteractor_AreToolsRunning(t *testing.T) {
	s := newUserSuite(t, nil)
	defer s.ctrl.Finish()

	const (
		username         = "john"
		expectedResponse = true
	)

	ctx := context.Background()

	s.mocks.k8sClientMock.EXPECT().IsUserToolPODRunning(ctx, username).Return(expectedResponse, nil)

	running, err := s.interactor.AreToolsRunning(ctx, username)

	require.NoError(t, err)
	require.Equal(t, expectedResponse, running)
}

func TestInteractor_StopTools(t *testing.T) {
	s := newUserSuite(t, nil)
	defer s.ctrl.Finish()

	const (
		username     = "john"
		toolsRunning = true
	)

	ctx := context.Background()
	expectedUser := entity.User{Username: username}

	s.mocks.repo.EXPECT().GetByUsername(ctx, username).Return(expectedUser, nil)
	s.mocks.k8sClientMock.EXPECT().IsUserToolPODRunning(ctx, username).Return(toolsRunning, nil)
	s.mocks.k8sClientMock.EXPECT().DeleteUserToolsCR(ctx, username).Return(nil)

	returnedUser, err := s.interactor.StopTools(ctx, username)

	require.NoError(t, err)
	require.Equal(t, expectedUser, returnedUser)
}

func TestInteractor_StopTools_Err(t *testing.T) {
	s := newUserSuite(t, nil)
	defer s.ctrl.Finish()

	const (
		username     = "john"
		toolsRunning = false
	)

	ctx := context.Background()
	u := entity.User{Username: username}
	emptyUser := entity.User{}

	s.mocks.repo.EXPECT().GetByUsername(ctx, username).Return(u, nil)
	s.mocks.k8sClientMock.EXPECT().IsUserToolPODRunning(ctx, username).Return(toolsRunning, nil)

	returnedUser, err := s.interactor.StopTools(ctx, username)

	require.Equal(t, user.ErrStopUserTools, err)
	require.Equal(t, returnedUser, emptyUser)
}

func TestInteractor_StartTools(t *testing.T) {
	s := newUserSuite(t, nil)
	defer s.ctrl.Finish()

	const (
		username     = "john"
		toolsRunning = false
		runtimeImage = "konstellation/image"
		runtimeTag   = "3.9"
	)

	runtimeID := "12345"

	ctx := context.Background()
	expectedUser := entity.User{Username: username}
	expectedRuntime := entity.Runtime{ID: runtimeID, DockerImage: runtimeImage, DockerTag: runtimeTag}

	s.mocks.repo.EXPECT().GetByUsername(ctx, username).Return(expectedUser, nil)
	s.mocks.runtimeRepo.EXPECT().Get(ctx, runtimeID).Return(expectedRuntime, nil)
	s.mocks.k8sClientMock.EXPECT().IsUserToolPODRunning(ctx, username).Return(toolsRunning, nil)
	s.mocks.k8sClientMock.EXPECT().CreateUserToolsCR(ctx, username, runtimeID, runtimeImage, runtimeTag).Return(nil)

	returnedUser, err := s.interactor.StartTools(ctx, username, &runtimeID)

	require.NoError(t, err)
	require.Equal(t, expectedUser, returnedUser)
}

func TestInteractor_StartTools_DefaultRuntime(t *testing.T) {
	// GIVEN there is a default image defined for the Runtime
	cfg := config.Config{}
	cfg.UserToolsVsCodeRuntime.Image.Repository = "defaultImage"
	cfg.UserToolsVsCodeRuntime.Image.Tag = "3.9"

	s := newUserSuite(t, &cfg)
	defer s.ctrl.Finish()

	const (
		username     = "john"
		toolsRunning = false
		runtimeID    = "default"
	)

	ctx := context.Background()
	expectedUser := entity.User{Username: username}

	// AND the user is the in repo
	s.mocks.repo.EXPECT().GetByUsername(ctx, username).Return(expectedUser, nil)
	// AND the usertools for the user was not running
	s.mocks.k8sClientMock.EXPECT().IsUserToolPODRunning(ctx, username).Return(toolsRunning, nil)
	// AND the CR creation does not return any error
	s.mocks.k8sClientMock.EXPECT().CreateUserToolsCR(ctx, username, runtimeID,
		cfg.UserToolsVsCodeRuntime.Image.Repository, cfg.UserToolsVsCodeRuntime.Image.Tag).Return(nil)

	// WHEN the tools are started
	returnedUser, err := s.interactor.StartTools(ctx, username, nil)

	// THEN
	// There are no errors
	require.NoError(t, err)
	// The returned user is the expected
	require.Equal(t, expectedUser, returnedUser)
	// AND
	// EXPECT - The username was used to look for the user in the repository
	// EXPECT - The username was used to check if the usertools are running
	// EXPECT - The CR was created with the default image defined for the Runtime
} //nolint:wsl // we want the test to end with the comment to respect the AND orders

func TestInteractor_StartTools_Replace(t *testing.T) {
	// GIVEN there is a valid context
	s := newUserSuite(t, nil)
	defer s.ctrl.Finish()

	const (
		username     = "john"
		toolsRunning = true
		dockerImage  = "image"
		dockerTag    = "3.9"
	)

	runtimeID := "12345"
	expectedRuntime := entity.Runtime{ID: runtimeID, DockerImage: dockerImage, DockerTag: dockerTag}
	expectedUser := entity.User{Username: username}

	ctx := context.Background()

	// AND the user is the in repo
	s.mocks.repo.EXPECT().GetByUsername(ctx, username).AnyTimes().Return(expectedUser, nil)
	// AND the runtime is in the repo
	s.mocks.runtimeRepo.EXPECT().Get(ctx, runtimeID).Return(expectedRuntime, nil)
	// AND the user-tools are running
	s.mocks.k8sClientMock.EXPECT().IsUserToolPODRunning(ctx, username).AnyTimes().Return(toolsRunning, nil)
	// AND the CR deletion does not return any error
	s.mocks.k8sClientMock.EXPECT().DeleteUserToolsCR(ctx, username).Return(nil)
	// AND the CR creation does not return any error
	s.mocks.k8sClientMock.EXPECT().CreateUserToolsCR(ctx, username, runtimeID, dockerImage, dockerTag).Return(nil)

	// WHEN the tools are started
	returnedUser, err := s.interactor.StartTools(ctx, username, &runtimeID)

	// THEN there are no errors
	require.NoError(t, err)
	require.Equal(t, expectedUser, returnedUser)
	// AND the previously started tools were replaced by the new tools
} //nolint:wsl // we want the test to end with the comment to respect the AND orders

func TestInteractor_FindAll(t *testing.T) {
	s := newUserSuite(t, nil)
	defer s.ctrl.Finish()

	ctx := context.Background()
	expectedUsers := []entity.User{{Username: "john"}}

	s.mocks.repo.EXPECT().FindAll(ctx, false).Return(expectedUsers, nil)

	users, err := s.interactor.FindAll(ctx)

	require.NoError(t, err)
	require.Equal(t, expectedUsers, users)
}

func TestInteractor_FindAll_Err(t *testing.T) {
	s := newUserSuite(t, nil)
	defer s.ctrl.Finish()

	var emptyUsers []entity.User

	someErr := errUnexpected
	ctx := context.Background()

	s.mocks.repo.EXPECT().FindAll(ctx, false).Return(emptyUsers, someErr)

	users, err := s.interactor.FindAll(ctx)

	require.Equal(t, someErr, err)
	require.Equal(t, emptyUsers, users)
}

func TestInteractor_GetByUsername(t *testing.T) {
	s := newUserSuite(t, nil)
	defer s.ctrl.Finish()

	const username = "john"

	ctx := context.Background()
	expectedUser := entity.User{Username: username}

	s.mocks.repo.EXPECT().GetByUsername(ctx, username).Return(expectedUser, nil)

	u, err := s.interactor.GetByUsername(ctx, username)

	require.NoError(t, err)
	require.Equal(t, expectedUser, u)
}

func TestInteractor_GetByUsername_Err(t *testing.T) {
	s := newUserSuite(t, nil)
	defer s.ctrl.Finish()

	const username = "john"

	ctx := context.Background()
	someErr := entity.ErrUserNotFound
	emptyUser := entity.User{}

	s.mocks.repo.EXPECT().GetByUsername(ctx, username).Return(emptyUser, someErr)

	u, err := s.interactor.GetByUsername(ctx, username)

	require.Equal(t, someErr, err)
	require.Equal(t, emptyUser, u)
}

func TestInteractor_FindByIDs(t *testing.T) {
	s := newUserSuite(t, nil)
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
	s := newUserSuite(t, nil)
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
	s := newUserSuite(t, nil)
	defer s.ctrl.Finish()

	const (
		id            = "user.1234"
		email         = "user@email.com"
		username      = "john.doe"
		accessLevel   = entity.AccessLevelAdmin
		publicSSHKey  = "test-ssh-key-public"
		privateSSHKey = "test-ssh-key-private"
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

	s.mocks.k8sClientMock.EXPECT().IsUserToolPODRunning(ctx, username).Return(false, nil)
	s.mocks.sshGenerator.EXPECT().NewKeys().Return(sshKey, nil)
	s.mocks.k8sClientMock.EXPECT().UpdateUserSSHKeySecret(ctx, targetUser, publicSSHKey, privateSSHKey)
	s.mocks.giteaService.EXPECT().UpdateSSHKey(username, sshKey.Public).Return(nil)
	s.mocks.repo.EXPECT().UpdateSSHKey(ctx, username, sshKey).Return(nil)
	s.mocks.repo.EXPECT().GetByUsername(ctx, username).Return(targetUser, nil).AnyTimes()

	userData, err := s.interactor.RegenerateSSHKeys(ctx, targetUser)

	require.NoError(t, err)
	require.Equal(t, targetUser, userData)
}

func TestInteractor_RegenerateSSHKeys_UserToolsRunning(t *testing.T) {
	s := newUserSuite(t, nil)
	defer s.ctrl.Finish()

	const (
		id            = "user.1234"
		email         = "user@email.com"
		username      = "john.doe"
		accessLevel   = entity.AccessLevelAdmin
		publicSSHKey  = "test-ssh-key-public"
		privateSSHKey = "test-ssh-key-private"
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

	s.mocks.k8sClientMock.EXPECT().IsUserToolPODRunning(ctx, username).Return(true, nil)
	userData, err := s.interactor.RegenerateSSHKeys(ctx, targetUser)

	require.Equal(t, userData, entity.User{})
	require.Equal(t, err, user.ErrUserToolsActive)
}

func TestInteractor_UpdateAccessLevel(t *testing.T) {
	s := newUserSuite(t, nil)
	defer s.ctrl.Finish()

	const (
		id          = "user.1234"
		username    = "john.doe"
		email       = "john@doe.com"
		accessLevel = entity.AccessLevelAdmin
	)

	ctx := context.Background()

	targetUser := entity.User{
		ID:          id,
		Username:    username,
		Email:       email,
		AccessLevel: accessLevel,
	}

	ids := []string{id}
	users := []entity.User{targetUser}

	s.mocks.repo.EXPECT().UpdateAccessLevel(ctx, ids, accessLevel).Return(nil)
	s.mocks.repo.EXPECT().FindByIDs(ctx, ids).Return(users, nil).AnyTimes()
	s.mocks.giteaService.EXPECT().UpdateUserPermissions(username, accessLevel).Return(nil)

	returnedUsers, err := s.interactor.UpdateAccessLevel(ctx, ids, accessLevel)

	require.NoError(t, err)
	require.Equal(t, users, returnedUsers)
}

func TestInteractor_GetKubeconfig(t *testing.T) {
	s := newUserSuite(t, nil)
	defer s.ctrl.Finish()

	const (
		username       = "john.doe"
		areToolsActive = true
	)

	ctx := context.Background()
	expectedKubeconfig := []byte("test kubeconfig")

	// the secret must use the username slug instead of the username
	usernameSlug := slug.Make(username)

	s.mocks.k8sClientMock.EXPECT().GetUserKubeconfig(ctx, usernameSlug).Return(expectedKubeconfig, nil)
	s.mocks.k8sClientMock.EXPECT().IsUserToolPODRunning(ctx, username).Return(areToolsActive, nil)

	returnedKubeconfig, err := s.interactor.GetKubeconfig(ctx, username)

	require.NoError(t, err)
	require.Equal(t, string(expectedKubeconfig), returnedKubeconfig)
}

func TestInteractor_SynchronizeServiceAccountsForUsers(t *testing.T) {
	// GIVEN there are two active users
	// WHEN the serviceAccounts for the users are called
	// AND k8client.CreateUserServiceAccount is called two times
	// AND k8client.CreateUserServiceAccount is called with the usernameSlugs
	// AND there are no errors
	s := newUserSuite(t, nil)
	defer s.ctrl.Finish()

	const (
		id          = "user.1234"
		username    = "john.doe"
		email       = "john@doe.com"
		accessLevel = entity.AccessLevelAdmin
	)

	ctx := context.Background()

	targetUser := entity.User{
		ID:          id,
		Username:    username,
		Email:       email,
		AccessLevel: accessLevel,
		Deleted:     false,
	}

	users := []entity.User{targetUser, targetUser}

	s.mocks.repo.EXPECT().FindAll(ctx, true).Return(users, nil)
	s.mocks.k8sClientMock.EXPECT().CreateUserServiceAccount(ctx, targetUser.UsernameSlug()).Return(nil, nil).Times(len(users))

	// WHEN the CreateMissingServiceAccountsForUsers is called
	err := s.interactor.SynchronizeServiceAccountsForUsers()

	require.NoError(t, err)
}
