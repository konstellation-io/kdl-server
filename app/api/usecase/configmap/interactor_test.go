package configmap_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/konstellation-io/kdl-server/app/api/infrastructure/config"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/k8s"
	"github.com/konstellation-io/kdl-server/app/api/usecase/configmap"
	"github.com/konstellation-io/kdl-server/app/api/usecase/project"
	"github.com/konstellation-io/kdl-server/app/api/usecase/user"

	"github.com/go-logr/logr"
	"github.com/go-logr/zapr"
	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/watch"
)

const (
	templateKDLProjectConfigMap   = "project-template"
	templateKDLUserToolsConfigMap = "usertools-template"
)

var errUnexpected = errors.New("test error")

type configMapSuite struct {
	ctrl       *gomock.Controller
	interactor configmap.UseCase
	mocks      userMocks
}

type userMocks struct {
	logger         logr.Logger
	cfg            config.Config
	k8sClient      *k8s.MockClientInterface
	projectUseCase *project.MockUseCase
	userUseCase    *user.MockUseCase
}

func newConfigMapSuite(t *testing.T) *configMapSuite {
	ctrl := gomock.NewController(t)
	k8sClient := k8s.NewMockClientInterface(ctrl)

	zapLog, err := zap.NewDevelopment()
	require.NoError(t, err)

	logger := zapr.NewLogger(zapLog)

	userUseCase := user.NewMockUseCase(ctrl)
	projectUseCase := project.NewMockUseCase(ctrl)

	cfg := &config.Config{}

	interactor := configmap.NewInteractor(logger, *cfg, k8sClient, projectUseCase, userUseCase)

	return &configMapSuite{
		ctrl:       ctrl,
		interactor: interactor,
		mocks: userMocks{
			logger:         logger,
			cfg:            *cfg,
			k8sClient:      k8sClient,
			projectUseCase: projectUseCase,
			userUseCase:    userUseCase,
		},
	}
}

func TestInteractor_WatchConfigMapTemplates(t *testing.T) {
	s := newConfigMapSuite(t)
	defer s.ctrl.Finish()

	watcher := watch.NewFake()

	s.mocks.k8sClient.EXPECT().CreateConfigMapWatcher(gomock.Any()).Return(watcher, nil)

	s.mocks.k8sClient.EXPECT().GetConfigMapTemplateNameProject().Return(templateKDLProjectConfigMap)
	s.mocks.k8sClient.EXPECT().GetConfigMapTemplateNameUserTools().Return(templateKDLUserToolsConfigMap)
	s.mocks.projectUseCase.EXPECT().UpdateKDLProjects(gomock.Any()).Return(nil)

	s.mocks.k8sClient.EXPECT().GetConfigMapTemplateNameProject().Return(templateKDLProjectConfigMap)
	s.mocks.k8sClient.EXPECT().GetConfigMapTemplateNameUserTools().Return(templateKDLUserToolsConfigMap)
	s.mocks.projectUseCase.EXPECT().UpdateKDLProjects(gomock.Any()).Return(errUnexpected)

	s.mocks.k8sClient.EXPECT().GetConfigMapTemplateNameProject().Return(templateKDLProjectConfigMap)
	s.mocks.k8sClient.EXPECT().GetConfigMapTemplateNameUserTools().Return(templateKDLUserToolsConfigMap)
	s.mocks.userUseCase.EXPECT().UpdateKDLUserTools(gomock.Any()).Return(nil)

	s.mocks.k8sClient.EXPECT().GetConfigMapTemplateNameProject().Return(templateKDLProjectConfigMap)
	s.mocks.k8sClient.EXPECT().GetConfigMapTemplateNameUserTools().Return(templateKDLUserToolsConfigMap)
	s.mocks.userUseCase.EXPECT().UpdateKDLUserTools(gomock.Any()).Return(errUnexpected)

	go func() {
		// Simulate a change in the configmap, response UpdateKDLProjects ok
		<-time.After(100 * time.Millisecond)
		watcher.Modify(&v1.ConfigMap{
			ObjectMeta: metav1.ObjectMeta{
				Name: templateKDLProjectConfigMap,
			},
		})

		// Simulate a change in the configmap, response UpdateKDLProjects error
		<-time.After(100 * time.Millisecond)
		watcher.Modify(&v1.ConfigMap{
			ObjectMeta: metav1.ObjectMeta{
				Name: templateKDLProjectConfigMap,
			},
		})

		// Simulate a change in the configmap, response UpdateKDLUserTools ok
		<-time.After(100 * time.Millisecond)
		watcher.Modify(&v1.ConfigMap{
			ObjectMeta: metav1.ObjectMeta{
				Name: templateKDLUserToolsConfigMap,
			},
		})

		// Simulate a change in the configmap, response UpdateKDLUserTools error
		<-time.After(100 * time.Millisecond)
		watcher.Modify(&v1.ConfigMap{
			ObjectMeta: metav1.ObjectMeta{
				Name: templateKDLUserToolsConfigMap,
			},
		})

		// modify other than configmap
		<-time.After(100 * time.Millisecond)
		watcher.Modify(&v1.Pod{})

		watcher.Stop()
	}()

	err := s.interactor.WatchConfigMapTemplates(context.Background())
	require.NoError(t, err)
}

func TestInteractor_WatchConfigMapTemplates_Error(t *testing.T) {
	s := newConfigMapSuite(t)
	defer s.ctrl.Finish()

	s.mocks.k8sClient.EXPECT().CreateConfigMapWatcher(gomock.Any()).Return(nil, errUnexpected)

	err := s.interactor.WatchConfigMapTemplates(context.Background())
	require.Error(t, err)
}
