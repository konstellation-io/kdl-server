//go:build integration

package k8s_test

import (
	"context"
	"testing"

	"github.com/go-logr/zapr"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/config"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/k8s"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go/modules/k3s"
	"go.uber.org/zap"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
)

const (
	namespace = "kdl-test"
)

type testSuite struct {
	suite.Suite
	Container *k3s.K3sContainer
	Client    *k8s.Client
	Clientset *kubernetes.Clientset
}

func TestSuite(t *testing.T) {
	suite.Run(t, new(testSuite))
}

func (s *testSuite) SetupSuite() {
	ctx := context.Background()

	// Launch a k3s container
	k3sContainer, err := k3s.Run(ctx, "docker.io/rancher/k3s:v1.27.1-k3s1")
	s.Require().NoError(err)

	s.Container = k3sContainer

	// Create a clientset
	kubeConfigYaml, err := k3sContainer.GetKubeConfig(ctx)
	s.Require().NoError(err)

	restcfg, err := clientcmd.RESTConfigFromKubeConfig(kubeConfigYaml)
	s.Require().NoError(err)

	s.Clientset, err = kubernetes.NewForConfig(restcfg)
	s.Require().NoError(err)

	// Create a namespace
	_, err = s.Clientset.CoreV1().Namespaces().Create(ctx, &v1.Namespace{
		ObjectMeta: metav1.ObjectMeta{
			Name: namespace,
		},
	}, metav1.CreateOptions{})
	s.Require().NoError(err)

	// Create an k8s infrastructure client
	zapLog, err := zap.NewDevelopment()
	s.Require().NoError(err)

	logger := zapr.NewLogger(zapLog)

	cfg := config.Config{
		Kubernetes: config.KubernetesConfig{
			IsInsideCluster: true,
			Namespace:       namespace,
		},
	}

	s.Client = k8s.New(
		logger,
		cfg,
		s.Clientset,
		nil,
		nil,
	)
}

func (s *testSuite) TearDownSuite() {
	err := s.Container.Terminate(context.Background())
	s.Require().NoError(err)
}

func (s *testSuite) TearDownTest() {
	err := s.Clientset.CoreV1().Secrets(namespace).DeleteCollection(context.Background(), metav1.DeleteOptions{}, metav1.ListOptions{})
	s.Require().NoError(err)

	err = s.Clientset.CoreV1().ServiceAccounts(namespace).DeleteCollection(context.Background(), metav1.DeleteOptions{}, metav1.ListOptions{})
	s.Require().NoError(err)
}
