package screenconfiguration_test

import (
	"context"
	"testing"

	"github.com/go-logr/logr"
	"github.com/go-logr/zapr"
	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/suite"
	"go.uber.org/zap"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/usecase/screenconfiguration"
)

type screenConfigurationSuite struct {
	suite.Suite
	ctrl       *gomock.Controller
	interactor screenconfiguration.UseCase
	mocks      screenConfigurationMocks
}

type screenConfigurationMocks struct {
	repo   *screenconfiguration.MockRepository
	logger logr.Logger
}

func TestScreenConfigurationSuite(t *testing.T) {
	suite.Run(t, new(screenConfigurationSuite))
}

func (ts *screenConfigurationSuite) SetupSuite() {
	ts.ctrl = gomock.NewController(ts.T())

	ts.mocks.repo = screenconfiguration.NewMockRepository(ts.ctrl)

	zapLog, err := zap.NewDevelopment()
	ts.Require().NoError(err)

	ts.mocks.logger = zapr.NewLogger(zapLog)

	ts.interactor = screenconfiguration.NewInteractor(ts.mocks.logger, ts.mocks.repo)
}

func (ts *screenConfigurationSuite) TearDownTest() {
	ts.ctrl.Finish()
}

func (ts *screenConfigurationSuite) TestInteractor_GetCreateProjectSettings() {
	ctx := context.Background()

	ts.mocks.repo.EXPECT().GetCreateProjectSettings(ctx).Return(entity.CreateProjectSettings{}, nil)

	setting, err := ts.interactor.GetCreateProjectSettings(ctx)

	// Assert
	ts.Require().NoError(err)
	ts.Require().NotNil(setting)
}
