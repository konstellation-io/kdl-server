package user_test

import (
	"context"
	"github.com/konstellation-io/kdl-server/app/api/pkg/giteaclient"
	"testing"
	"time"

	"github.com/golang/mock/gomock"
	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/pkg/clock"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
	"github.com/konstellation-io/kdl-server/app/api/pkg/sshhelper"
	"github.com/konstellation-io/kdl-server/app/api/usecase/user"
	"github.com/stretchr/testify/require"
)

type userSuite struct {
	ctrl       *gomock.Controller
	interactor user.UseCase
	mocks      userMocks
}

type userMocks struct {
	logger       *logging.MockLogger
	repo         *user.MockRepository
	sshGenerator *sshhelper.MockSSHKeyGenerator
	clock        *clock.MockClock
	giteaClient  *giteaclient.MockGiteaClient
}

func newUserSuite(t *testing.T) *userSuite {
	ctrl := gomock.NewController(t)

	logger := logging.NewMockLogger(ctrl)
	logging.AddLoggerExpects(logger)

	repo := user.NewMockRepository(ctrl)

	clockMock := clock.NewMockClock(ctrl)
	sshGenerator := sshhelper.NewMockSSHKeyGenerator(ctrl)
	giteaClientMock := giteaclient.NewMockGiteaClient(ctrl)

	interactor := user.NewInteractor(logger, repo, sshGenerator, clockMock, giteaClientMock)

	return &userSuite{
		ctrl:       ctrl,
		interactor: interactor,
		mocks: userMocks{
			logger:       logger,
			repo:         repo,
			sshGenerator: sshGenerator,
			clock:        clockMock,
			giteaClient:  giteaClientMock,
		},
	}
}

func TestInteractor_Create(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	const (
		id            = "user.1234"
		email         = "user@email.com"
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
		Email:        email,
		AccessLevel:  accessLevel,
		SSHKey:       sshKey,
		CreationDate: now,
	}

	expectedUser := entity.User{
		ID:           id,
		Email:        email,
		AccessLevel:  accessLevel,
		SSHKey:       sshKey,
		CreationDate: now,
	}

	s.mocks.clock.EXPECT().Now().Return(now)
	s.mocks.sshGenerator.EXPECT().NewKeys().Return(sshKey, nil)
	s.mocks.repo.EXPECT().Create(ctx, u).Return(id, nil)
	s.mocks.repo.EXPECT().Get(ctx, id).Return(expectedUser, nil)
	s.mocks.giteaClient.EXPECT().CreateUser(email).Return(nil)

	createdUser, err := s.interactor.Create(ctx, email, accessLevel)

	require.Nil(t, err)
	require.Equal(t, expectedUser, createdUser)
}
