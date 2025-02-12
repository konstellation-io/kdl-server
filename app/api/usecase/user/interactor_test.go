package user_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/go-logr/logr"
	"github.com/go-logr/zapr"
	"github.com/golang/mock/gomock"
	"github.com/gosimple/slug"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
	v1 "k8s.io/api/core/v1"
	k8errors "k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/config"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/k8s"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/minioadminservice"
	"github.com/konstellation-io/kdl-server/app/api/pkg/clock"
	"github.com/konstellation-io/kdl-server/app/api/pkg/kdlutil"
	"github.com/konstellation-io/kdl-server/app/api/pkg/sshhelper"
	"github.com/konstellation-io/kdl-server/app/api/usecase/capabilities"
	"github.com/konstellation-io/kdl-server/app/api/usecase/project"
	"github.com/konstellation-io/kdl-server/app/api/usecase/runtime"
	"github.com/konstellation-io/kdl-server/app/api/usecase/user"
)

const templateConfigMap = "template-name"

var (
	errUnexpected    = errors.New("some error")
	errUpdatingCrd   = errors.New("error updating crd")
	errNoConfigMap   = errors.New("no configmap")
	errListUsertools = errors.New("error listing usertools")
)

type userSuite struct {
	ctrl       *gomock.Controller
	interactor user.UseCase
	mocks      userMocks
}

type userMocks struct {
	repo              *user.MockRepository
	userActivityRepo  *project.MockUserActivityRepo
	runtimeRepo       *runtime.MockRepository
	capabilitiesRepo  *capabilities.MockRepository
	sshGenerator      *sshhelper.MockSSHKeyGenerator
	clock             *clock.MockClock
	k8sClientMock     *k8s.MockClientInterface
	logger            logr.Logger
	cfg               config.Config
	minioAdminService *minioadminservice.MockMinioAdminInterface
	randomGenerator   *kdlutil.MockRandomGenerator
}

func newUserSuite(t *testing.T) *userSuite {
	ctrl := gomock.NewController(t)
	repo := user.NewMockRepository(ctrl)
	userActivityRepo := project.NewMockUserActivityRepo(ctrl)
	repoRuntimes := runtime.NewMockRepository(ctrl)
	repoCapabilities := capabilities.NewMockRepository(ctrl)
	clockMock := clock.NewMockClock(ctrl)
	sshGenerator := sshhelper.NewMockSSHKeyGenerator(ctrl)
	k8sClientMock := k8s.NewMockClientInterface(ctrl)
	minioAdminService := minioadminservice.NewMockMinioAdminInterface(ctrl)
	randomGenerator := kdlutil.NewMockRandomGenerator(ctrl)

	zapLog, err := zap.NewDevelopment()
	require.NoError(t, err)

	logger := zapr.NewLogger(zapLog)

	cfg := &config.Config{}

	interactor := user.NewInteractor(logger, *cfg, repo, userActivityRepo, repoRuntimes, repoCapabilities, sshGenerator,
		clockMock, k8sClientMock, minioAdminService, randomGenerator)

	return &userSuite{
		ctrl:       ctrl,
		interactor: interactor,
		mocks: userMocks{
			logger:            logger,
			cfg:               *cfg,
			repo:              repo,
			userActivityRepo:  userActivityRepo,
			runtimeRepo:       repoRuntimes,
			capabilitiesRepo:  repoCapabilities,
			sshGenerator:      sshGenerator,
			clock:             clockMock,
			k8sClientMock:     k8sClientMock,
			minioAdminService: minioAdminService,
			randomGenerator:   randomGenerator,
		},
	}
}

func TestInteractor_Create(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	const (
		id             = "user.1234"
		email          = "user@email.com"
		username       = "user"
		sub            = "f6717d2b-ac1f-40da-ade6-00037512933b"
		accessLevel    = entity.AccessLevelAdmin
		publicSSHKey   = "test-ssh-key-public"
		privateSSHKey  = "test-ssh-key-private"
		minioSecretKey = "test-minio-secret-key" // #nosec G101
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
		Sub:          sub,
		AccessLevel:  accessLevel,
		SSHKey:       sshKey,
		CreationDate: now,
	}

	userWithCredentials := u
	userWithCredentials.MinioAccessKey = entity.MinioAccessKey{
		AccessKey: email,
		SecretKey: minioSecretKey,
	}

	expectedUser := userWithCredentials
	expectedUser.ID = id

	expectedCreateUserActVars := []entity.UserActivityVar{
		{
			Key:   "USER_ID",
			Value: id,
		},
	}

	s.mocks.repo.EXPECT().GetByUsername(ctx, username).Return(entity.User{}, entity.ErrUserNotFound)
	s.mocks.repo.EXPECT().GetByEmail(ctx, email).Return(entity.User{}, entity.ErrUserNotFound)
	s.mocks.repo.EXPECT().GetBySub(ctx, sub).Return(entity.User{}, entity.ErrUserNotFound)
	s.mocks.clock.EXPECT().Now().Return(now)
	s.mocks.sshGenerator.EXPECT().NewKeys().Return(sshKey, nil)
	s.mocks.randomGenerator.EXPECT().GenerateRandomString(40).Return(minioSecretKey, nil)
	s.mocks.minioAdminService.EXPECT().CreateUser(ctx, email, minioSecretKey).Return(email, nil)
	s.mocks.k8sClientMock.EXPECT().CreateUserSSHKeySecret(ctx, u, publicSSHKey, privateSSHKey)
	s.mocks.k8sClientMock.EXPECT().CreateUserServiceAccount(ctx, u.UsernameSlug())
	s.mocks.repo.EXPECT().Create(ctx, userWithCredentials).Return(id, nil)
	s.mocks.repo.EXPECT().Get(ctx, id).Return(expectedUser, nil)
	s.mocks.clock.EXPECT().Now().Return(now)
	s.mocks.userActivityRepo.EXPECT().Create(
		ctx,
		entity.UserActivity{
			Date:   now,
			UserID: id,
			Type:   entity.UserActivityTypeCreateUser,
			Vars:   expectedCreateUserActVars,
		},
	).Return(nil)

	createdUser, err := s.interactor.Create(ctx, email, sub, accessLevel)

	require.NoError(t, err)
	require.Equal(t, expectedUser, createdUser)
}

func TestInteractor_Create_UserDuplEmail(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	const (
		email       = "user@email.com"
		user        = "user"
		sub         = "f6717d2b-ac1f-40da-ade6-00037512933b"
		accessLevel = entity.AccessLevelAdmin
	)

	ctx := context.Background()

	s.mocks.repo.EXPECT().GetByUsername(ctx, user).Return(entity.User{}, entity.ErrUserNotFound)
	s.mocks.repo.EXPECT().GetByEmail(ctx, email).Return(entity.User{}, nil)

	createdUser, err := s.interactor.Create(ctx, email, sub, accessLevel)
	require.ElementsMatch(t, entity.User{}, createdUser)
	require.ErrorIs(t, err, entity.ErrDuplicatedUser)
}

func TestInteractor_Create_UserDuplUsername(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	const (
		email       = "user@email.com"
		user        = "user"
		sub         = "f6717d2b-ac1f-40da-ade6-00037512933b"
		accessLevel = entity.AccessLevelAdmin
	)

	ctx := context.Background()

	s.mocks.repo.EXPECT().GetByUsername(ctx, user).Return(entity.User{}, nil)

	createdUser, err := s.interactor.Create(ctx, email, sub, accessLevel)
	require.ElementsMatch(t, entity.User{}, createdUser)
	require.ErrorIs(t, err, entity.ErrDuplicatedUser)
}

func TestInteractor_Create_UserDuplSub(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	const (
		email       = "user@email.com"
		user        = "user"
		sub         = "f6717d2b-ac1f-40da-ade6-00037512933b"
		accessLevel = entity.AccessLevelAdmin
	)

	ctx := context.Background()

	s.mocks.repo.EXPECT().GetByUsername(ctx, user).Return(entity.User{}, entity.ErrUserNotFound)
	s.mocks.repo.EXPECT().GetByEmail(ctx, email).Return(entity.User{}, entity.ErrUserNotFound)
	s.mocks.repo.EXPECT().GetBySub(ctx, sub).Return(entity.User{}, nil)

	createdUser, err := s.interactor.Create(ctx, email, sub, accessLevel)
	require.ElementsMatch(t, entity.User{}, createdUser)
	require.ErrorIs(t, err, entity.ErrDuplicatedUser)
}

func TestInteractor_AreToolsRunning(t *testing.T) {
	s := newUserSuite(t)
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
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	const (
		username     = "john"
		email        = "john@doe.com"
		toolsRunning = true
	)

	ctx := context.Background()
	expectedUser := entity.User{Username: username, Email: email}

	s.mocks.repo.EXPECT().GetByEmail(ctx, email).Return(expectedUser, nil)
	s.mocks.k8sClientMock.EXPECT().GetUserToolsPodStatus(ctx, username).Return(entity.PodStatusRunning, nil)
	s.mocks.k8sClientMock.EXPECT().DeleteUserToolsCR(ctx, username).Return(nil)

	returnedUser, err := s.interactor.StopTools(ctx, email)

	require.NoError(t, err)
	require.Equal(t, expectedUser, returnedUser)
}

func TestInteractor_StopTools_Err(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	const (
		username     = "john"
		email        = "john@doe.com"
		toolsRunning = false
	)

	ctx := context.Background()
	u := entity.User{Username: username, Email: email}
	emptyUser := entity.User{}

	s.mocks.repo.EXPECT().GetByEmail(ctx, email).Return(u, nil)
	s.mocks.k8sClientMock.EXPECT().GetUserToolsPodStatus(ctx, username).Return(entity.PodStatusRunning, nil)
	s.mocks.k8sClientMock.EXPECT().DeleteUserToolsCR(ctx, username).Return(errUnexpected)

	returnedUser, err := s.interactor.StopTools(ctx, email)

	require.Error(t, err)
	require.Equal(t, returnedUser, emptyUser)
}

func TestInteractor_StartTools(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	const (
		username       = "john"
		slugUsername   = "john"
		email          = "john@doe.com"
		toolsRunning   = false
		runtimeImage   = "konstellation/image"
		runtimeTag     = "3.9"
		minioSecretKey = "john-doe-secret"
	)

	capability := entity.Capabilities{
		ID:   "test_id",
		Name: "Test capability",
		NodeSelectors: map[string]string{
			"test1": "value1",
		},
		Tolerations: []map[string]interface{}{},
		Affinities:  map[string]interface{}{},
	}

	runtimeID := "12345"

	data := k8s.UserToolsData{
		Username:     username,
		SlugUsername: slugUsername,
		RuntimeID:    runtimeID,
		RuntimeImage: runtimeImage,
		RuntimeTag:   runtimeTag,
		Capabilities: capability,
		MinioAccessKey: entity.MinioAccessKey{
			AccessKey: email,
			SecretKey: minioSecretKey,
		},
	}

	ctx := context.Background()
	expectedUser := entity.User{
		Username: username,
		Email:    email,
		MinioAccessKey: entity.MinioAccessKey{
			AccessKey: email,
			SecretKey: minioSecretKey,
		},
	}
	expectedRuntime := entity.Runtime{ID: runtimeID, DockerImage: runtimeImage, DockerTag: runtimeTag}

	s.mocks.repo.EXPECT().GetByEmail(ctx, email).Return(expectedUser, nil)
	s.mocks.runtimeRepo.EXPECT().Get(ctx, runtimeID).Return(expectedRuntime, nil)
	s.mocks.capabilitiesRepo.EXPECT().Get(ctx, capability.ID).Return(capability, nil)
	s.mocks.k8sClientMock.EXPECT().IsUserToolPODRunning(ctx, username).Return(toolsRunning, nil)
	s.mocks.k8sClientMock.EXPECT().CreateKDLUserToolsCR(ctx, data).Return(nil)

	returnedUser, err := s.interactor.StartTools(ctx, email, &runtimeID, &capability.ID)

	require.NoError(t, err)
	require.Equal(t, expectedUser, returnedUser)
}

func TestInteractor_StartTools_DefaultRuntime(t *testing.T) {
	// GIVEN there is a default image defined for the Runtime
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	const (
		username     = "john"
		slugUsername = "john"
		email        = "john@doe.com"
		toolsRunning = false
	)

	capability := entity.Capabilities{
		ID:   "test_id",
		Name: "Test capability",
		NodeSelectors: map[string]string{
			"test1": "value1",
		},
		Tolerations: []map[string]interface{}{},
		Affinities:  map[string]interface{}{},
	}

	data := k8s.UserToolsData{
		Username:     username,
		SlugUsername: slugUsername,
		Capabilities: capability,
	}

	ctx := context.Background()
	expectedUser := entity.User{Username: username, Email: email}

	// AND the user is the in repo
	s.mocks.repo.EXPECT().GetByEmail(ctx, email).Return(expectedUser, nil)
	// AND the usertools for the user was not running
	s.mocks.k8sClientMock.EXPECT().IsUserToolPODRunning(ctx, username).Return(toolsRunning, nil)

	s.mocks.capabilitiesRepo.EXPECT().Get(ctx, capability.ID).Return(capability, nil)
	// AND the CR creation does not return any error
	s.mocks.k8sClientMock.EXPECT().CreateKDLUserToolsCR(ctx, data).Return(nil)

	// WHEN the tools are started
	returnedUser, err := s.interactor.StartTools(ctx, email, nil, &capability.ID)

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
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	const (
		username     = "john"
		slugUsername = "john"
		email        = "john@doe.com"
		toolsRunning = true
		dockerImage  = "image"
		dockerTag    = "3.9"
	)

	runtimeID := "12345"
	expectedRuntime := entity.Runtime{ID: runtimeID, DockerImage: dockerImage, DockerTag: dockerTag}
	expectedUser := entity.User{Username: username, Email: email}

	capability := entity.Capabilities{
		ID:   "test_id",
		Name: "Test capability",
		NodeSelectors: map[string]string{
			"test1": "value1",
		},
		Tolerations: []map[string]interface{}{},
		Affinities:  map[string]interface{}{},
	}

	data := k8s.UserToolsData{
		Username:     username,
		SlugUsername: slugUsername,
		RuntimeID:    runtimeID,
		RuntimeImage: dockerImage,
		RuntimeTag:   dockerTag,
		Capabilities: capability,
	}

	ctx := context.Background()

	// AND the user is the in repo
	s.mocks.repo.EXPECT().GetByEmail(ctx, email).AnyTimes().Return(expectedUser, nil)
	// AND the runtime is in the repo
	s.mocks.runtimeRepo.EXPECT().Get(ctx, runtimeID).Return(expectedRuntime, nil)
	// AND the user-tools are running
	s.mocks.k8sClientMock.EXPECT().IsUserToolPODRunning(ctx, username).AnyTimes().Return(toolsRunning, nil)
	// AND the CR deletion does not return any error
	s.mocks.k8sClientMock.EXPECT().DeleteUserToolsCR(ctx, username).Return(nil)

	s.mocks.capabilitiesRepo.EXPECT().Get(ctx, capability.ID).Return(capability, nil)
	// AND the CR creation does not return any error
	s.mocks.k8sClientMock.EXPECT().CreateKDLUserToolsCR(ctx, data).Return(nil)
	// AND the Pod status is Running
	s.mocks.k8sClientMock.EXPECT().GetUserToolsPodStatus(ctx, username).Return(entity.PodStatusRunning, nil)

	// WHEN the tools are started
	returnedUser, err := s.interactor.StartTools(ctx, email, &runtimeID, &capability.ID)

	// THEN there are no errors
	require.NoError(t, err)
	require.Equal(t, expectedUser, returnedUser)
	// AND the previously started tools were replaced by the new tools
} //nolint:wsl // we want the test to end with the comment to respect the AND orders

func TestInteractor_FindAll(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()
	expectedUsers := []entity.User{{Username: "john"}}

	s.mocks.repo.EXPECT().FindAll(ctx, false).Return(expectedUsers, nil)

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

	s.mocks.repo.EXPECT().FindAll(ctx, false).Return(emptyUsers, someErr)

	users, err := s.interactor.FindAll(ctx)

	require.ErrorIs(t, someErr, err)
	require.Equal(t, emptyUsers, users)
}

func TestInteractor_GetByEmail(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	const email = "john@doe.com"

	ctx := context.Background()
	expectedUser := entity.User{Email: email}

	s.mocks.repo.EXPECT().GetByEmail(ctx, email).Return(expectedUser, nil)

	u, err := s.interactor.GetByEmail(ctx, email)

	require.NoError(t, err)
	require.Equal(t, expectedUser, u)
}

func TestInteractor_GetByEmail_Err(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	const email = "john@doe.com"

	ctx := context.Background()
	someErr := entity.ErrUserNotFound
	emptyUser := entity.User{}

	s.mocks.repo.EXPECT().GetByEmail(ctx, email).Return(emptyUser, someErr)

	u, err := s.interactor.GetByEmail(ctx, email)

	require.ErrorIs(t, someErr, err)
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

func TestInteractor_RegenerateSSHKeys_ExistingSSHKeys(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	const (
		id            = "user.1234"
		email         = "user@email.com"
		username      = "john.doe"
		usernameSlug  = "john-doe"
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
	s.mocks.k8sClientMock.EXPECT().GetUserSSHKeyPublic(ctx, usernameSlug).Return([]byte{}, nil)
	s.mocks.k8sClientMock.EXPECT().UpdateUserSSHKeySecret(ctx, targetUser, publicSSHKey, privateSSHKey)
	s.mocks.repo.EXPECT().UpdateSSHKey(ctx, username, sshKey).Return(nil)
	s.mocks.repo.EXPECT().GetByUsername(ctx, username).Return(targetUser, nil).AnyTimes()

	userData, err := s.interactor.RegenerateSSHKeys(ctx, targetUser)

	require.NoError(t, err)
	require.Equal(t, targetUser, userData)
}

func TestInteractor_RegenerateSSHKeys_NotExistingSSHKeys(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	const (
		id            = "user.1234"
		email         = "user@email.com"
		username      = "john.doe"
		usernameSlug  = "john-doe"
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
	s.mocks.k8sClientMock.EXPECT().GetUserSSHKeyPublic(ctx, usernameSlug).Return(nil, k8errors.NewNotFound(v1.Resource("user"), usernameSlug))
	s.mocks.k8sClientMock.EXPECT().CreateUserSSHKeySecret(ctx, targetUser, publicSSHKey, privateSSHKey).Return(nil)
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

	s.mocks.repo.EXPECT().GetByUsername(ctx, username).Return(targetUser, nil)
	s.mocks.k8sClientMock.EXPECT().IsUserToolPODRunning(ctx, username).Return(true, nil)
	userData, err := s.interactor.RegenerateSSHKeys(ctx, targetUser)

	require.ElementsMatch(t, entity.User{}, userData)
	require.ErrorIs(t, err, user.ErrUserToolsActive)
}

func TestInteractor_UpdateAccessLevel(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	const newAccessLevel = entity.AccessLevelManager

	ctx := context.Background()
	now := time.Now().UTC()

	loggedUser := entity.User{
		ID: "logged-user",
	}

	users := []entity.User{
		{ID: "userA", Username: "user_a", AccessLevel: entity.AccessLevelViewer},
		{ID: "userB", Username: "user_b", AccessLevel: entity.AccessLevelViewer},
	}
	ids := []string{users[0].ID, users[1].ID}

	actVars := [][]entity.UserActivityVar{
		{
			{
				Key: "USER_ID", Value: users[0].ID,
			},
			{
				Key: "OLD_ACCESS_LEVEL", Value: string(entity.AccessLevelViewer),
			},
			{
				Key: "NEW_ACCESS_LEVEL", Value: string(newAccessLevel),
			},
		},
		{
			{
				Key: "USER_ID", Value: users[1].ID,
			},
			{
				Key: "OLD_ACCESS_LEVEL", Value: string(entity.AccessLevelViewer),
			},
			{
				Key: "NEW_ACCESS_LEVEL", Value: string(newAccessLevel),
			},
		},
	}

	s.mocks.repo.EXPECT().FindByIDs(ctx, ids).Return(users, nil)
	s.mocks.repo.EXPECT().UpdateAccessLevel(ctx, ids, newAccessLevel).Return(nil)
	s.mocks.clock.EXPECT().Now().Return(now)
	s.mocks.userActivityRepo.EXPECT().Create(ctx, entity.UserActivity{
		Date:   now,
		UserID: loggedUser.ID,
		Type:   entity.UserActivityTypeUpdateUserAccessLevel,
		Vars:   actVars[0],
	}).Return(nil)
	s.mocks.userActivityRepo.EXPECT().Create(ctx, entity.UserActivity{
		Date:   now,
		UserID: loggedUser.ID,
		Type:   entity.UserActivityTypeUpdateUserAccessLevel,
		Vars:   actVars[1],
	}).Return(nil)
	s.mocks.repo.EXPECT().FindByIDs(ctx, ids).Return(users, nil).AnyTimes()

	returnedUsers, err := s.interactor.UpdateAccessLevel(ctx, ids, newAccessLevel, loggedUser.ID)

	require.NoError(t, err)
	require.Equal(t, users, returnedUsers)
}

func TestInteractor_UpdateSub(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	const (
		id          = "user.1234"
		username    = "john.doe"
		sub         = "f6717d2b-ac1f-40da-ade6-00037512933b"
		email       = "john@doe.com"
		accessLevel = entity.AccessLevelAdmin
	)

	ctx := context.Background()

	user := entity.User{
		ID:          id,
		Username:    username,
		Email:       email,
		AccessLevel: accessLevel,
	}

	s.mocks.repo.EXPECT().GetBySub(ctx, sub).Return(entity.User{}, entity.ErrUserNotFound)
	s.mocks.repo.EXPECT().UpdateSub(ctx, username, sub).Return(nil)
	s.mocks.repo.EXPECT().GetByUsername(ctx, username).Return(user, nil)

	returnedUser, err := s.interactor.UpdateSub(ctx, user, sub)

	require.NoError(t, err)
	require.Equal(t, user, returnedUser)
}

func TestInteractor_UpdateSub_UpdateError(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	const (
		id          = "user.1234"
		username    = "john.doe"
		sub         = "f6717d2b-ac1f-40da-ade6-00037512933b"
		email       = "john@doe.com"
		accessLevel = entity.AccessLevelAdmin
	)

	ctx := context.Background()

	user := entity.User{
		ID:          id,
		Username:    username,
		Email:       email,
		AccessLevel: accessLevel,
	}

	s.mocks.repo.EXPECT().GetBySub(ctx, sub).Return(entity.User{}, entity.ErrUserNotFound)
	s.mocks.repo.EXPECT().UpdateSub(ctx, username, sub).Return(errUnexpected)

	returnedUser, err := s.interactor.UpdateSub(ctx, user, sub)

	require.Error(t, err)
	require.Equal(t, entity.User{}, returnedUser)
}

func TestInteractor_UpdateSub_DuplicatedUserSub(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	const (
		id          = "user.1234"
		username    = "john.doe"
		sub         = "f6717d2b-ac1f-40da-ade6-00037512933b"
		email       = "john@doe.com"
		accessLevel = entity.AccessLevelAdmin
	)

	ctx := context.Background()

	user := entity.User{
		ID:          id,
		Username:    username,
		Email:       email,
		Sub:         sub,
		AccessLevel: accessLevel,
	}

	s.mocks.repo.EXPECT().GetBySub(ctx, sub).Return(user, nil)

	returnedUser, err := s.interactor.UpdateSub(ctx, user, sub)

	require.Error(t, err)
	require.ErrorIs(t, err, entity.ErrDuplicatedUser)
	require.Equal(t, entity.User{}, returnedUser)
}

func TestInteractor_GetKubeconfig(t *testing.T) {
	s := newUserSuite(t)
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

func TestInteractor_SyncUserData(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	const (
		id           = "user.1234"
		username     = "john.doe"
		usernameSlug = "john-doe"
		email        = "john@doe.com"
		syncSA       = true
		syncSSHKeys  = true
		syncMinio    = true
	)

	ctx := context.Background()

	user := entity.User{
		ID:       id,
		Username: username,
		Email:    email,
	}

	s.mocks.repo.EXPECT().Get(ctx, id).Return(user, nil)
	s.mocks.k8sClientMock.EXPECT().CreateUserServiceAccount(ctx, user.UsernameSlug()).Return(nil, nil)
	s.mocks.k8sClientMock.EXPECT().IsUserToolPODRunning(ctx, username).Return(false, nil)
	s.mocks.sshGenerator.EXPECT().NewKeys().Return(entity.SSHKey{}, nil)
	s.mocks.k8sClientMock.EXPECT().GetUserSSHKeyPublic(ctx, usernameSlug).Return([]byte{}, nil)
	s.mocks.k8sClientMock.EXPECT().UpdateUserSSHKeySecret(ctx, user, gomock.Any(), gomock.Any()).Return(nil)
	s.mocks.repo.EXPECT().UpdateSSHKey(ctx, username, gomock.Any()).Return(nil)
	s.mocks.repo.EXPECT().GetByUsername(ctx, username).Return(user, nil).AnyTimes()
	s.mocks.minioAdminService.EXPECT().CreateUser(ctx, email, user.MinioAccessKey.SecretKey).Return(email, nil)

	err := s.interactor.SyncUserData(ctx, id, syncSA, syncSSHKeys, syncMinio)
	require.NoError(t, err)
}

func TestInteractor_SyncUserData_InputSyncIsFalse(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	const (
		id          = "user.1234"
		username    = "john.doe"
		email       = "john@doe.com"
		syncSA      = false
		syncSSHKeys = false
		syncMinio   = false
	)

	ctx := context.Background()

	user := entity.User{
		ID:       id,
		Username: username,
		Email:    email,
		MinioAccessKey: entity.MinioAccessKey{
			AccessKey: email,
			SecretKey: "john-doe-secret",
		},
	}

	s.mocks.repo.EXPECT().Get(ctx, id).Return(user, nil)

	err := s.interactor.SyncUserData(ctx, id, syncSA, syncSSHKeys, syncMinio)
	require.NoError(t, err)
}

func TestInteractor_SyncUserData_MissingUserId(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	const (
		id          = "user.1234"
		syncSA      = true
		syncSSHKeys = true
		syncMinio   = true
	)

	ctx := context.Background()

	s.mocks.repo.EXPECT().Get(ctx, id).Return(entity.User{}, errUnexpected)

	err := s.interactor.SyncUserData(ctx, id, syncSA, syncSSHKeys, syncMinio)
	require.Error(t, err)
}

func TestInteractor_SyncUserData_CreateServiceAccountError(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	const (
		id           = "user.1234"
		username     = "john.doe"
		usernameSlug = "john-doe"
		email        = "john@doe.com"
		syncSA       = true
		syncSSHKeys  = true
		syncMinio    = true
	)

	ctx := context.Background()

	user := entity.User{
		ID:       id,
		Username: username,
		Email:    email,
		MinioAccessKey: entity.MinioAccessKey{
			AccessKey: email,
			SecretKey: "john-doe-secret",
		},
	}

	s.mocks.repo.EXPECT().Get(ctx, id).Return(user, nil)
	s.mocks.k8sClientMock.EXPECT().CreateUserServiceAccount(ctx, user.UsernameSlug()).Return(nil, errUnexpected)
	s.mocks.k8sClientMock.EXPECT().IsUserToolPODRunning(ctx, username).Return(false, nil)
	s.mocks.sshGenerator.EXPECT().NewKeys().Return(entity.SSHKey{}, nil)
	s.mocks.k8sClientMock.EXPECT().GetUserSSHKeyPublic(ctx, usernameSlug).Return([]byte{}, nil)
	s.mocks.k8sClientMock.EXPECT().UpdateUserSSHKeySecret(ctx, user, gomock.Any(), gomock.Any()).Return(nil)
	s.mocks.repo.EXPECT().UpdateSSHKey(ctx, username, gomock.Any()).Return(nil)
	s.mocks.repo.EXPECT().GetByUsername(ctx, username).Return(user, nil).AnyTimes()
	s.mocks.minioAdminService.EXPECT().CreateUser(ctx, email, user.MinioAccessKey.SecretKey).Return(email, nil)

	err := s.interactor.SyncUserData(ctx, id, syncSA, syncSSHKeys, syncMinio)
	require.Error(t, err)
}

func TestInteractor_SyncUserData_RegenerateSSHKeysError(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	const (
		id           = "user.1234"
		username     = "john.doe"
		usernameSlug = "john-doe"
		email        = "john@doe.com"
		syncSA       = true
		syncSSHKeys  = true
		syncMinio    = true
	)

	ctx := context.Background()

	user := entity.User{
		ID:       id,
		Username: username,
		Email:    email,
		MinioAccessKey: entity.MinioAccessKey{
			AccessKey: email,
			SecretKey: "john-doe-secret",
		},
	}

	s.mocks.repo.EXPECT().Get(ctx, id).Return(user, nil)
	s.mocks.k8sClientMock.EXPECT().CreateUserServiceAccount(ctx, user.UsernameSlug()).Return(nil, errUnexpected)
	s.mocks.k8sClientMock.EXPECT().IsUserToolPODRunning(ctx, username).Return(false, nil)
	s.mocks.sshGenerator.EXPECT().NewKeys().Return(entity.SSHKey{}, nil)
	s.mocks.k8sClientMock.EXPECT().GetUserSSHKeyPublic(ctx, usernameSlug).Return(nil, errUnexpected)
	s.mocks.repo.EXPECT().GetByUsername(ctx, username).Return(user, nil).AnyTimes()
	s.mocks.minioAdminService.EXPECT().CreateUser(ctx, email, user.MinioAccessKey.SecretKey).Return(email, nil)

	err := s.interactor.SyncUserData(ctx, id, syncSA, syncSSHKeys, syncMinio)
	require.Error(t, err)
}

func TestInteractor_SyncUserData_CreateMinioUserError(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	const (
		id           = "user.1234"
		username     = "john.doe"
		usernameSlug = "john-doe"
		email        = "john@doe.com"
		syncSA       = true
		syncSSHKeys  = true
		syncMinio    = true
	)

	ctx := context.Background()

	user := entity.User{
		ID:       id,
		Username: username,
		Email:    email,
		MinioAccessKey: entity.MinioAccessKey{
			AccessKey: email,
			SecretKey: "john-doe-secret",
		},
	}

	s.mocks.repo.EXPECT().Get(ctx, id).Return(user, nil)
	s.mocks.k8sClientMock.EXPECT().CreateUserServiceAccount(ctx, user.UsernameSlug()).Return(nil, errUnexpected)
	s.mocks.k8sClientMock.EXPECT().IsUserToolPODRunning(ctx, username).Return(false, nil)
	s.mocks.sshGenerator.EXPECT().NewKeys().Return(entity.SSHKey{}, nil)
	s.mocks.k8sClientMock.EXPECT().GetUserSSHKeyPublic(ctx, usernameSlug).Return([]byte{}, nil)
	s.mocks.k8sClientMock.EXPECT().UpdateUserSSHKeySecret(ctx, user, gomock.Any(), gomock.Any()).Return(nil)
	s.mocks.repo.EXPECT().UpdateSSHKey(ctx, username, gomock.Any()).Return(nil)
	s.mocks.repo.EXPECT().GetByUsername(ctx, username).Return(user, nil).AnyTimes()
	s.mocks.minioAdminService.EXPECT().CreateUser(ctx, email, user.MinioAccessKey.SecretKey).Return("", errUnexpected)

	err := s.interactor.SyncUserData(ctx, id, syncSA, syncSSHKeys, syncMinio)
	require.Error(t, err)
}

func TestInteractor_UpdateKDLUserTools(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()

	configMap := v1.ConfigMap{
		Data: map[string]string{},
	}
	configMap.Data["template"] = ""

	crd := map[string]interface{}{}

	listKDLUserTools := []unstructured.Unstructured{
		{
			Object: map[string]interface{}{
				"metadata": map[string]interface{}{
					"name": "kdlusertools-v1",
				},
				"spec": map[string]interface{}{
					"podLabels": map[string]interface{}{
						"runtimeId":    "12345",
						"capabilityId": "54321",
					},
				},
			},
		},
	}

	s.mocks.k8sClientMock.EXPECT().GetConfigMapTemplateNameKDLUserTools().Return(templateConfigMap)
	s.mocks.k8sClientMock.EXPECT().GetConfigMap(ctx, templateConfigMap).Return(&configMap, nil)
	s.mocks.k8sClientMock.EXPECT().ListKDLUserToolsCR(ctx).Return(listKDLUserTools, nil)
	s.mocks.k8sClientMock.EXPECT().UpdateKDLUserToolsCR(ctx, "kdlusertools-v1", &crd).Return(nil)

	err := s.interactor.UpdateKDLUserTools(ctx)
	require.NoError(t, err)
}

func TestInteractor_UpdateKDLUserTools_UpdateKDLUserToolsCR_Error(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()

	configMap := v1.ConfigMap{
		Data: map[string]string{},
	}
	configMap.Data["template"] = ""

	crd := map[string]interface{}{}

	listKDLUserTools := []unstructured.Unstructured{
		{
			Object: map[string]interface{}{
				"metadata": map[string]interface{}{
					"name": "kdlusertools-v1",
				},
				"spec": map[string]interface{}{
					"podLabels": map[string]interface{}{
						"runtimeId":    "12345",
						"capabilityId": "54321",
					},
				},
			},
		},
	}

	s.mocks.k8sClientMock.EXPECT().GetConfigMapTemplateNameKDLUserTools().Return(templateConfigMap)
	s.mocks.k8sClientMock.EXPECT().GetConfigMap(ctx, templateConfigMap).Return(&configMap, nil)
	s.mocks.k8sClientMock.EXPECT().ListKDLUserToolsCR(ctx).Return(listKDLUserTools, nil)
	s.mocks.k8sClientMock.EXPECT().UpdateKDLUserToolsCR(ctx, "kdlusertools-v1", &crd).Return(errUpdatingCrd)

	// even if there is an error updating the CRD,
	// the function should return no error to allow updating the next CRD
	err := s.interactor.UpdateKDLUserTools(ctx)
	require.NoError(t, err)
}

func TestInteractor_UpdateKDLUserTools_NoConfigmap(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()

	s.mocks.k8sClientMock.EXPECT().GetConfigMapTemplateNameKDLUserTools().Return(templateConfigMap)
	s.mocks.k8sClientMock.EXPECT().GetConfigMap(ctx, templateConfigMap).Return(nil, errNoConfigMap)

	err := s.interactor.UpdateKDLUserTools(ctx)
	require.Error(t, err)
}

func TestInteractor_UpdateKDLUserTools_CDRTemplate_ErrorNoTemplate(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()

	configMap := v1.ConfigMap{}

	s.mocks.k8sClientMock.EXPECT().GetConfigMapTemplateNameKDLUserTools().Return(templateConfigMap)
	s.mocks.k8sClientMock.EXPECT().GetConfigMap(ctx, templateConfigMap).Return(&configMap, nil)

	err := s.interactor.UpdateKDLUserTools(ctx)
	require.Error(t, err)
}

func TestInteractor_UpdateKDLUserTools_ListKDLUserToolsNameCR_Error(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()

	configMap := v1.ConfigMap{
		Data: map[string]string{},
	}
	configMap.Data["template"] = ""

	s.mocks.k8sClientMock.EXPECT().GetConfigMapTemplateNameKDLUserTools().Return(templateConfigMap)
	s.mocks.k8sClientMock.EXPECT().GetConfigMap(ctx, templateConfigMap).Return(&configMap, nil)
	s.mocks.k8sClientMock.EXPECT().ListKDLUserToolsCR(ctx).Return(nil, errListUsertools)

	err := s.interactor.UpdateKDLUserTools(ctx)
	require.Error(t, err)
}

func TestInteractor_UpdateKDLUserTools_ListKDLUserToolsNameCR_EmptyList(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()

	configMap := v1.ConfigMap{
		Data: map[string]string{},
	}
	configMap.Data["template"] = ""

	s.mocks.k8sClientMock.EXPECT().GetConfigMapTemplateNameKDLUserTools().Return(templateConfigMap)
	s.mocks.k8sClientMock.EXPECT().GetConfigMap(ctx, templateConfigMap).Return(&configMap, nil)
	s.mocks.k8sClientMock.EXPECT().ListKDLUserToolsCR(ctx).Return([]unstructured.Unstructured{}, nil)

	err := s.interactor.UpdateKDLUserTools(ctx)
	require.NoError(t, err)
}
