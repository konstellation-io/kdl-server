package user_test

import (
	"context"
	"testing"
	"time"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/pkg/clock"
	"github.com/konstellation-io/kdl-server/app/api/pkg/giteaclient"
	"github.com/konstellation-io/kdl-server/app/api/pkg/k8s"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
	"github.com/konstellation-io/kdl-server/app/api/pkg/sshhelper"
	"github.com/konstellation-io/kdl-server/app/api/usecase/user"
)

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
	giteaClient   *giteaclient.MockGiteaClient
	k8sClientMock *k8s.MockK8sClient
}

func newUserSuite(t *testing.T) *userSuite {
	ctrl := gomock.NewController(t)

	logger := logging.NewMockLogger(ctrl)
	logging.AddLoggerExpects(logger)

	repo := user.NewMockRepository(ctrl)

	clockMock := clock.NewMockClock(ctrl)
	sshGenerator := sshhelper.NewMockSSHKeyGenerator(ctrl)
	giteaClientMock := giteaclient.NewMockGiteaClient(ctrl)
	k8sClientMock := k8s.NewMockK8sClient(ctrl)

	interactor := user.NewInteractor(logger, repo, sshGenerator, clockMock, giteaClientMock, k8sClientMock)

	return &userSuite{
		ctrl:       ctrl,
		interactor: interactor,
		mocks: userMocks{
			logger:        logger,
			repo:          repo,
			sshGenerator:  sshGenerator,
			clock:         clockMock,
			giteaClient:   giteaClientMock,
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
		username      = "john"
		accessLevel   = entity.AccessLevelAdmin
		publicSSHKey  = "test-ssh-key-public"
		privateSSHKey = "test-ssh-key-private"
		secretName    = "john-ssh-keys" //nolint:gosec // it is a unit test
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
	s.mocks.giteaClient.EXPECT().CreateUser(email, username, password).Return(nil)
	s.mocks.giteaClient.EXPECT().AddSSHKey(username, sshKey.Public).Return(nil)
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
