package controller_test

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/go-logr/logr"
	"github.com/go-logr/zapr"
	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/suite"
	"go.uber.org/zap"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/http/controller"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/config"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/k8s"
	"github.com/konstellation-io/kdl-server/app/api/pkg/clock"
	"github.com/konstellation-io/kdl-server/app/api/pkg/sshhelper"
	"github.com/konstellation-io/kdl-server/app/api/usecase/capabilities"
	"github.com/konstellation-io/kdl-server/app/api/usecase/runtime"
	"github.com/konstellation-io/kdl-server/app/api/usecase/user"
)

var errUnexpected = errors.New("some error")

type userMocks struct {
	logger           logr.Logger
	cfg              config.Config
	repo             *user.MockRepository
	runtimeRepo      *runtime.MockRepository
	capabilitiesRepo *capabilities.MockRepository
	sshGenerator     *sshhelper.MockSSHKeyGenerator
	clock            *clock.MockClock
	k8sClient        *k8s.MockClientInterface
}

type LoginControllerTestSuite struct {
	suite.Suite
	ctrl            *gomock.Controller
	loginController *controller.LoginController
	mocks           userMocks
}

func TestLoginControllerTestSuite(t *testing.T) {
	suite.Run(t, new(LoginControllerTestSuite))
}

func (ts *LoginControllerTestSuite) SetupSuite() {
	ts.ctrl = gomock.NewController(ts.T())
	defer ts.ctrl.Finish()

	ts.mocks.repo = user.NewMockRepository(ts.ctrl)
	ts.mocks.runtimeRepo = runtime.NewMockRepository(ts.ctrl)
	ts.mocks.capabilitiesRepo = capabilities.NewMockRepository(ts.ctrl)
	ts.mocks.clock = clock.NewMockClock(ts.ctrl)
	ts.mocks.sshGenerator = sshhelper.NewMockSSHKeyGenerator(ts.ctrl)
	ts.mocks.k8sClient = k8s.NewMockClientInterface(ts.ctrl)

	zapLog, err := zap.NewDevelopment()
	ts.Require().NoError(err)

	ts.mocks.logger = zapr.NewLogger(zapLog)

	ts.mocks.cfg = config.Config{}

	interactor := user.NewInteractor(ts.mocks.logger, ts.mocks.cfg, ts.mocks.repo, ts.mocks.runtimeRepo,
		ts.mocks.capabilitiesRepo, ts.mocks.sshGenerator, ts.mocks.clock, ts.mocks.k8sClient)

	ts.loginController = controller.NewLoginController(interactor)
}

func (ts *LoginControllerTestSuite) TestLoginControllerNoEmailHeader() {
	// Arrange
	req := httptest.NewRequest(http.MethodGet, "/login", http.NoBody)
	req.Header.Set("X-Forwarded-User", "john")
	req.Header.Set("X-Forwarded-Email", "")

	w := httptest.NewRecorder()

	// Act
	ts.loginController.HandleLogin(w, req)

	// Assert
	ts.Equal(http.StatusUnauthorized, w.Code)
}

func (ts *LoginControllerTestSuite) TestLoginControllerNoUserHeader() {
	req := httptest.NewRequest(http.MethodGet, "/login", http.NoBody)
	req.Header.Set("X-Forwarded-User", "")
	req.Header.Set("X-Forwarded-Email", "user@email.com")

	w := httptest.NewRecorder()

	// Act
	ts.loginController.HandleLogin(w, req)

	// Assert
	ts.Equal(http.StatusUnauthorized, w.Code)
}

func (ts *LoginControllerTestSuite) TestLoginControllerUsernameNotFound() {
	// Arrange
	const (
		id            = "user.1234"
		email         = "user@email.com"
		username      = "user"
		sub           = "d5d70477-5192-4182-b80e-5d34550eb4fe"
		accessLevel   = entity.AccessLevelViewer
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
		Sub:          sub,
		AccessLevel:  accessLevel,
		SSHKey:       sshKey,
		CreationDate: now,
	}
	expectedUser := entity.User{
		ID:           id,
		Username:     username,
		Email:        email,
		Sub:          sub,
		AccessLevel:  accessLevel,
		SSHKey:       sshKey,
		CreationDate: now,
	}

	ts.mocks.repo.EXPECT().GetByEmail(ctx, email).Return(entity.User{}, entity.ErrUserNotFound)
	ts.mocks.repo.EXPECT().GetByUsername(ctx, username).Return(entity.User{}, entity.ErrUserNotFound)
	ts.mocks.repo.EXPECT().GetByEmail(ctx, email).Return(entity.User{}, entity.ErrUserNotFound)
	ts.mocks.repo.EXPECT().GetBySub(ctx, sub).Return(entity.User{}, entity.ErrUserNotFound)
	ts.mocks.clock.EXPECT().Now().Return(now)
	ts.mocks.sshGenerator.EXPECT().NewKeys().Return(sshKey, nil)
	ts.mocks.repo.EXPECT().Create(ctx, u).Return(id, nil)
	ts.mocks.repo.EXPECT().Get(ctx, id).Return(expectedUser, nil)
	ts.mocks.k8sClient.EXPECT().CreateUserSSHKeySecret(ctx, u, publicSSHKey, privateSSHKey)
	ts.mocks.k8sClient.EXPECT().CreateUserServiceAccount(ctx, expectedUser.UsernameSlug())
	ts.mocks.clock.EXPECT().Now().Return(now)
	ts.mocks.repo.EXPECT().UpdateLastActivity(ctx, expectedUser.Username, now).Return(nil)
	ts.mocks.repo.EXPECT().GetByUsername(ctx, expectedUser.Username).Return(expectedUser, nil)

	req := httptest.NewRequest(http.MethodGet, "/login", http.NoBody)
	req.Header.Set("X-Forwarded-Email", email)
	req.Header.Set("X-Forwarded-User", sub)

	w := httptest.NewRecorder()

	// Act
	ts.loginController.HandleLogin(w, req)

	// Assert
	ts.Equal(http.StatusFound, w.Code)
}

func (ts *LoginControllerTestSuite) TestLoginControllerUsernameNotFound_CreateError() {
	// Arrange
	const (
		id            = "user.1234"
		email         = "user@email.com"
		username      = "user"
		sub           = "d5d70477-5192-4182-b80e-5d34550eb4fe"
		accessLevel   = entity.AccessLevelViewer
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
		Sub:          sub,
		AccessLevel:  accessLevel,
		SSHKey:       sshKey,
		CreationDate: now,
	}

	ts.mocks.repo.EXPECT().GetByEmail(ctx, email).Return(entity.User{}, entity.ErrUserNotFound)
	ts.mocks.repo.EXPECT().GetByUsername(ctx, username).Return(entity.User{}, entity.ErrUserNotFound)
	ts.mocks.repo.EXPECT().GetByEmail(ctx, email).Return(entity.User{}, entity.ErrUserNotFound)
	ts.mocks.repo.EXPECT().GetBySub(ctx, sub).Return(entity.User{}, entity.ErrUserNotFound)
	ts.mocks.clock.EXPECT().Now().Return(now)
	ts.mocks.sshGenerator.EXPECT().NewKeys().Return(sshKey, nil)
	ts.mocks.repo.EXPECT().Create(ctx, u).Return(id, errUnexpected)

	req := httptest.NewRequest(http.MethodGet, "/login", http.NoBody)
	req.Header.Set("X-Forwarded-Email", email)
	req.Header.Set("X-Forwarded-User", sub)

	w := httptest.NewRecorder()

	// Act
	ts.loginController.HandleLogin(w, req)

	// Assert
	ts.Equal(http.StatusInternalServerError, w.Code)
}

func (ts *LoginControllerTestSuite) TestLoginControllerUsernameFound_SubEmpty() {
	// Arrange
	const (
		email    = "user@email.com"
		username = "user"
		sub      = "e8fc5009-d220-427f-bf8c-dd63b69ca6f5"
	)

	ctx := context.Background()
	now := time.Now().UTC()

	user := entity.User{
		Username: username,
		Email:    email,
	}

	ts.mocks.repo.EXPECT().GetByEmail(ctx, email).Return(user, nil)
	ts.mocks.repo.EXPECT().GetBySub(ctx, sub).Return(entity.User{}, entity.ErrUserNotFound)
	ts.mocks.repo.EXPECT().UpdateSub(ctx, user.Username, sub).Return(nil)
	ts.mocks.repo.EXPECT().GetByUsername(ctx, user.Username).Return(user, nil)
	ts.mocks.clock.EXPECT().Now().Return(now)
	ts.mocks.repo.EXPECT().UpdateLastActivity(ctx, user.Username, now).Return(nil)
	ts.mocks.repo.EXPECT().GetByUsername(ctx, user.Username).Return(user, nil)

	req := httptest.NewRequest(http.MethodGet, "/login", http.NoBody)
	req.Header.Set("X-Forwarded-Email", email)
	req.Header.Set("X-Forwarded-User", sub)

	w := httptest.NewRecorder()

	// Act
	ts.loginController.HandleLogin(w, req)

	// Assert
	ts.Equal(http.StatusFound, w.Code)
}

func (ts *LoginControllerTestSuite) TestLoginControllerUsernameFound_DifferentSub() {
	// Arrange
	const (
		email    = "user@email.com"
		username = "user"
		sub      = "e8fc5009-d220-427f-bf8c-dd63b69ca6f5"
		newSub   = "e8fc5009-d220-427f-bf8c-dd63b69ca6f6"
	)

	ctx := context.Background()
	now := time.Now().UTC()

	user := entity.User{
		Username: username,
		Email:    email,
		Sub:      sub,
	}

	ts.mocks.repo.EXPECT().GetByEmail(ctx, email).Return(user, nil)
	ts.mocks.repo.EXPECT().GetBySub(ctx, newSub).Return(entity.User{}, entity.ErrUserNotFound)
	ts.mocks.repo.EXPECT().UpdateSub(ctx, user.Username, newSub).Return(nil)
	ts.mocks.repo.EXPECT().GetByUsername(ctx, user.Username).Return(user, nil)
	ts.mocks.clock.EXPECT().Now().Return(now)
	ts.mocks.repo.EXPECT().UpdateLastActivity(ctx, user.Username, now).Return(nil)
	ts.mocks.repo.EXPECT().GetByUsername(ctx, user.Username).Return(user, nil)

	req := httptest.NewRequest(http.MethodGet, "/login", http.NoBody)
	req.Header.Set("X-Forwarded-Email", email)
	req.Header.Set("X-Forwarded-User", newSub)

	w := httptest.NewRecorder()

	// Act
	ts.loginController.HandleLogin(w, req)

	// Assert
	ts.Equal(http.StatusFound, w.Code)
}

func (ts *LoginControllerTestSuite) TestLoginControllerUsernameFound_EqualSub() {
	// Arrange
	const (
		email    = "user@email.com"
		username = "user"
		sub      = "e8fc5009-d220-427f-bf8c-dd63b69ca6f5"
	)

	ctx := context.Background()
	now := time.Now().UTC()

	user := entity.User{
		Username: username,
		Email:    email,
		Sub:      sub,
	}

	ts.mocks.repo.EXPECT().GetByEmail(ctx, email).Return(user, nil)
	ts.mocks.clock.EXPECT().Now().Return(now)
	ts.mocks.repo.EXPECT().UpdateLastActivity(ctx, user.Username, now).Return(nil)
	ts.mocks.repo.EXPECT().GetByUsername(ctx, user.Username).Return(user, nil)

	req := httptest.NewRequest(http.MethodGet, "/login", http.NoBody)
	req.Header.Set("X-Forwarded-Email", email)
	req.Header.Set("X-Forwarded-User", sub)

	w := httptest.NewRecorder()

	// Act
	ts.loginController.HandleLogin(w, req)

	// Assert
	ts.Equal(http.StatusFound, w.Code)
}

func (ts *LoginControllerTestSuite) TestLoginControllerUsernameFound_UpdateSubErr() {
	// Arrange
	const (
		email    = "user@email.com"
		username = "user"
		sub      = "e8fc5009-d220-427f-bf8c-dd63b69ca6f5"
		newSub   = "e8fc5009-d220-427f-bf8c-dd63b69ca6f6"
	)

	ctx := context.Background()

	user := entity.User{
		Username: username,
		Email:    email,
		Sub:      sub,
	}

	ts.mocks.repo.EXPECT().GetByEmail(ctx, email).Return(user, nil)
	ts.mocks.repo.EXPECT().GetBySub(ctx, newSub).Return(entity.User{}, entity.ErrUserNotFound)
	ts.mocks.repo.EXPECT().UpdateSub(ctx, user.Username, newSub).Return(errUnexpected)

	req := httptest.NewRequest(http.MethodGet, "/login", http.NoBody)
	req.Header.Set("X-Forwarded-Email", email)
	req.Header.Set("X-Forwarded-User", newSub)

	w := httptest.NewRecorder()

	// Act
	ts.loginController.HandleLogin(w, req)

	// Assert
	ts.Equal(http.StatusInternalServerError, w.Code)
}
