package middleware_test

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/go-logr/logr"
	"github.com/go-logr/zapr"
	"go.uber.org/zap"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/http/middleware"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/config"
	"github.com/konstellation-io/kdl-server/app/api/usecase/capabilities"
	"github.com/konstellation-io/kdl-server/app/api/usecase/runtime"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/suite"

	"github.com/konstellation-io/kdl-server/app/api/infrastructure/k8s"
	"github.com/konstellation-io/kdl-server/app/api/pkg/clock"
	"github.com/konstellation-io/kdl-server/app/api/pkg/sshhelper"
	"github.com/konstellation-io/kdl-server/app/api/usecase/user"
)

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

type AuthMiddlewareTestSuite struct {
	suite.Suite
	ctrl       *gomock.Controller
	interactor user.UseCase
	mocks      userMocks
}

func TestAuthMiddlewareTestSuite(t *testing.T) {
	suite.Run(t, new(AuthMiddlewareTestSuite))
}

func (ts *AuthMiddlewareTestSuite) SetupSuite() {
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

	ts.interactor = user.NewInteractor(ts.mocks.logger, ts.mocks.cfg, ts.mocks.repo, ts.mocks.runtimeRepo,
		ts.mocks.capabilitiesRepo, ts.mocks.sshGenerator, ts.mocks.clock, ts.mocks.k8sClient)
}

func (ts *AuthMiddlewareTestSuite) TestAuthMiddlewareNoEmailHeader() {
	// Arrange
	handlerFunc := http.HandlerFunc(func(_ http.ResponseWriter, _ *http.Request) {})

	req := httptest.NewRequest(http.MethodGet, "/", http.NoBody)
	req.Header.Set("X-Forwarded-User", "john")
	req.Header.Set("X-Forwarded-Email", "")

	res := httptest.NewRecorder()

	authM := middleware.AuthMiddleware(handlerFunc, ts.interactor)
	authM.ServeHTTP(res, req)

	// Assert
	ts.Equal(http.StatusUnauthorized, res.Code)
}

func (ts *AuthMiddlewareTestSuite) TestAuthMiddlewareNoUserHeader() {
	// Arrange
	handlerFunc := http.HandlerFunc(func(_ http.ResponseWriter, _ *http.Request) {})

	req := httptest.NewRequest(http.MethodGet, "/", http.NoBody)
	req.Header.Set("X-Forwarded-User", "")
	req.Header.Set("X-Forwarded-Email", "user@email.com")

	res := httptest.NewRecorder()

	authM := middleware.AuthMiddleware(handlerFunc, ts.interactor)
	authM.ServeHTTP(res, req)

	// Assert
	ts.Equal(http.StatusUnauthorized, res.Code)
}

func (ts *AuthMiddlewareTestSuite) TestMiddlewareAuthUsernameNotFound() {
	// Arrange
	const (
		id            = "user.1234"
		email         = "user@email.com"
		username      = "user"
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

	ts.mocks.repo.EXPECT().GetByEmail(ctx, email).Return(entity.User{}, entity.ErrUserNotFound)
	ts.mocks.repo.EXPECT().GetByUsername(ctx, username).Return(entity.User{}, entity.ErrUserNotFound)
	ts.mocks.repo.EXPECT().GetByEmail(ctx, email).Return(entity.User{}, entity.ErrUserNotFound)
	ts.mocks.clock.EXPECT().Now().Return(now)
	ts.mocks.sshGenerator.EXPECT().NewKeys().Return(sshKey, nil)
	ts.mocks.repo.EXPECT().Create(ctx, u).Return(id, nil)
	ts.mocks.repo.EXPECT().Get(ctx, id).Return(expectedUser, nil)
	ts.mocks.k8sClient.EXPECT().CreateUserSSHKeySecret(ctx, u, publicSSHKey, privateSSHKey)
	ts.mocks.k8sClient.EXPECT().CreateUserServiceAccount(ctx, u.UsernameSlug())

	// Act
	handlerFunc := http.HandlerFunc(func(_ http.ResponseWriter, r *http.Request) {
		ts.Equal(email, r.Context().Value(middleware.LoggedUserEmailKey))
	})

	req := httptest.NewRequest(http.MethodGet, "/", http.NoBody)
	req.Header.Set("X-Forwarded-Email", email)
	req.Header.Set("X-Forwarded-User", username)

	res := httptest.NewRecorder()

	authM := middleware.AuthMiddleware(handlerFunc, ts.interactor)
	authM.ServeHTTP(res, req)

	// Assert
	ts.Equal(http.StatusOK, res.Code)
}

func (ts *AuthMiddlewareTestSuite) TestMiddlewareAuthUsernameFound() {
	// Arrange
	const (
		email       = "user@email.com"
		username    = "john"
		accessLevel = entity.AccessLevelViewer
	)

	ctx := context.Background()

	ts.mocks.repo.EXPECT().GetByEmail(ctx, email).Return(entity.User{}, nil)

	// Act
	handlerFunc := http.HandlerFunc(func(_ http.ResponseWriter, r *http.Request) {
		ts.Equal(email, r.Context().Value(middleware.LoggedUserEmailKey))
	})

	req := httptest.NewRequest(http.MethodGet, "/", http.NoBody)
	req.Header.Set("X-Forwarded-Email", email)
	req.Header.Set("X-Forwarded-User", username)

	res := httptest.NewRecorder()

	authM := middleware.AuthMiddleware(handlerFunc, ts.interactor)
	authM.ServeHTTP(res, req)

	// Assert
	ts.Equal(http.StatusOK, res.Code)
}
