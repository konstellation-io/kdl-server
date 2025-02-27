package k8s

import (
	"os"
	"path/filepath"

	"github.com/konstellation-io/kdl-server/app/api/infrastructure/config"

	"github.com/go-logr/logr"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
)

const (
	kdlUserToolsGroup      = "kdl.konstellation.io"
	kdlUserToolsResource   = "kdlusertools"
	kdlUserToolsVersion    = "v1"
	kdlUserToolsAPIVersion = kdlUserToolsGroup + "/" + kdlUserToolsVersion

	kdlProjectGroup      = "kdl.konstellation.io"
	kdlProjectResource   = "kdlprojects"
	kdlProjectVersion    = "v1"
	kdlProjectAPIVersion = kdlProjectGroup + "/" + kdlProjectVersion
)

var _ ClientInterface = (*Client)(nil)

type Client struct {
	logger          logr.Logger
	cfg             config.Config
	clientset       *kubernetes.Clientset
	kdlUserToolsRes dynamic.NamespaceableResourceInterface
	kdlProjectRes   dynamic.NamespaceableResourceInterface
}

func New(logger logr.Logger, cfg config.Config, clientset *kubernetes.Clientset, kdlUserToolsRes,
	kdlProjectRes dynamic.NamespaceableResourceInterface) *Client {
	return &Client{
		logger:          logger,
		cfg:             cfg,
		clientset:       clientset,
		kdlUserToolsRes: kdlUserToolsRes,
		kdlProjectRes:   kdlProjectRes,
	}
}

func NewK8sClient(logger logr.Logger, cfg config.Config) (ClientInterface, error) {
	kubeConfig := newKubernetesConfig(logger, cfg)

	clientset, err := kubernetes.NewForConfig(kubeConfig)
	if err != nil {
		return nil, err
	}

	dynamicClient, err := dynamic.NewForConfig(kubeConfig)
	if err != nil {
		return nil, err
	}

	kdlUserToolsRes := dynamicClient.Resource(schema.GroupVersionResource{
		Group:    kdlUserToolsGroup,
		Version:  kdlUserToolsVersion,
		Resource: kdlUserToolsResource,
	})

	kdlProjectRes := dynamicClient.Resource(schema.GroupVersionResource{
		Group:    kdlProjectGroup,
		Version:  kdlProjectVersion,
		Resource: kdlProjectResource,
	})

	c := New(logger, cfg, clientset, kdlUserToolsRes, kdlProjectRes)

	return c, nil
}

func newKubernetesConfig(logger logr.Logger, cfg config.Config) *rest.Config {
	if cfg.Kubernetes.IsInsideCluster {
		// retrieve k8 config from the cluster service
		logger.Info("Creating K8s config in-cluster")

		kubeConfig, err := rest.InClusterConfig()
		if err != nil {
			logger.Error(err, "fatal error kubernetes config")
		}

		return kubeConfig
	}

	// retrieve k8 config from the LOCAL KUBECONFIG file
	logger.Info("Creating K8s config from local .kube/config")

	// NOTE: It works only with the default user's config, not even the exported KUBECONFIG value
	kubeConfigPath := filepath.Join(os.Getenv("HOME"), ".kube", "config")

	// use the current context in kubeConfigPath
	kubeConfig, err := clientcmd.BuildConfigFromFlags("", kubeConfigPath)
	if err != nil {
		logger.Error(err, "fatal error kubernetes config")
	}

	return kubeConfig
}

func (k *Client) CheckConnection() bool {
	_, err := k.clientset.Discovery().ServerVersion()
	if err != nil {
		k.logger.Error(err, "Error checking connection to k8s")
		return false
	}

	return true
}
