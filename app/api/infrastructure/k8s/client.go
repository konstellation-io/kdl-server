package k8s

import (
	"log"
	"os"
	"path/filepath"

	"github.com/go-logr/logr"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/config"
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
	kubeConfig := newKubernetesConfig(cfg)

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

func newKubernetesConfig(cfg config.Config) *rest.Config {
	if cfg.Kubernetes.IsInsideCluster {
		// retrieve k8 config from the cluster service
		log.Printf("Creating K8s config in-cluster")

		kubeConfig, err := rest.InClusterConfig()
		if err != nil {
			log.Fatalf("fatal error kubernetes config: %s", err)
		}

		return kubeConfig
	}

	// retrieve k8 config from the LOCAL KUBECONFIG file
	log.Printf("Creating K8s config from local .kube/config")

	// NOTE: It works only with the default user's config, not even the exported KUBECONFIG value
	kubeConfigPath := filepath.Join(os.Getenv("HOME"), ".kube", "config")

	// use the current context in kubeConfigPath
	kubeConfig, err := clientcmd.BuildConfigFromFlags("", kubeConfigPath)
	if err != nil {
		log.Fatalf("fatal error kubernetes config: %s", err)
	}

	return kubeConfig
}
