package k8s_test

import (
	"context"
	"testing"

	gomock "github.com/golang/mock/gomock"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/config"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/k8s"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go/modules/k3s"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
)

type serviceAccountTestSuite struct {
	suite.Suite
	container *k3s.K3sContainer
	client    *k8s.K8sClient
	clientset *kubernetes.Clientset
}

func TestAPISuite(t *testing.T) {
	suite.Run(t, new(serviceAccountTestSuite))
}

func (s *serviceAccountTestSuite) SetupTest() {
	ctx := context.Background()

	// Launch a k3s container
	k3sContainer, err := k3s.Run(ctx, "docker.io/rancher/k3s:v1.27.1-k3s1")
	s.NoError(err)

	s.container = k3sContainer

	// Create a clientset
	kubeConfigYaml, err := k3sContainer.GetKubeConfig(ctx)
	s.NoError(err)

	restcfg, err := clientcmd.RESTConfigFromKubeConfig(kubeConfigYaml)
	s.NoError(err)

	s.clientset, err = kubernetes.NewForConfig(restcfg)
	s.NoError(err)

	// Create a namespace
	_, err = s.clientset.CoreV1().Namespaces().Create(ctx, &v1.Namespace{
		ObjectMeta: metav1.ObjectMeta{
			Name: "kdl-test",
		},
	}, metav1.CreateOptions{})
	s.NoError(err)

	// Create an k8s infrastructure client
	ctrl := gomock.NewController(s.T())
	logger := logging.NewMockLogger(ctrl)
	logging.AddLoggerExpects(logger)

	cfg := config.Config{
		Kubernetes: config.KubernetesConfig{
			IsInsideCluster: true,
			Namespace:       "kdl-test",
		},
	}

	s.client = k8s.New(
		logger,
		cfg,
		s.clientset,
		nil,
		nil,
	)
}

func (s *serviceAccountTestSuite) TearDownTest() {
	err := s.container.Terminate(context.Background())
	s.NoError(err)
}

func (s *serviceAccountTestSuite) TestCreateServiceAccount() {
	_, err := s.client.CreateUserServiceAccount(context.Background(), "sa")
	s.NoError(err)

	serviceAccount := s.clientset.CoreV1().ServiceAccounts("sa")
	s.NotNil(serviceAccount)

	_, err = s.client.GetUserServiceAccount(context.Background(), "sa")
	s.NoError(err)
}
