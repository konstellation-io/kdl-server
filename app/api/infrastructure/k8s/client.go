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
	userToolsGroup      = "kdl.konstellation.io"
	userToolsResource   = "usertools"
	userToolsVersion    = "v1alpha1"
	userToolsAPIVersion = userToolsGroup + "/" + userToolsVersion

	kdlprojectGroup      = "project.konstellation.io"
	kdlprojectResource   = "kdlprojects"
	kdlprojectVersion    = "v1"
	kdlprojectAPIVersion = kdlprojectGroup + "/" + kdlprojectVersion
)

type K8sClient struct {
	logger        logr.Logger
	cfg           config.Config
	clientset     *kubernetes.Clientset
	userToolsRes  dynamic.NamespaceableResourceInterface
	kdlprojectRes dynamic.NamespaceableResourceInterface
}

func New(logger logr.Logger, cfg config.Config, clientset *kubernetes.Clientset, userToolsRes,
	kdlprojectRes dynamic.NamespaceableResourceInterface) *K8sClient {
	return &K8sClient{
		logger:        logger,
		cfg:           cfg,
		clientset:     clientset,
		userToolsRes:  userToolsRes,
		kdlprojectRes: kdlprojectRes,
	}
}

func NewK8sClient(logger logr.Logger, cfg config.Config) (Client, error) {
	kubeConfig := newKubernetesConfig(cfg)

	clientset, err := kubernetes.NewForConfig(kubeConfig)
	if err != nil {
		return nil, err
	}

	dynamicClient, err := dynamic.NewForConfig(kubeConfig)
	if err != nil {
		return nil, err
	}

	userToolsRes := dynamicClient.Resource(schema.GroupVersionResource{
		Group:    userToolsGroup,
		Version:  userToolsVersion,
		Resource: userToolsResource,
	})

	kdlprojectRes := dynamicClient.Resource(schema.GroupVersionResource{
		Group:    kdlprojectGroup,
		Version:  kdlprojectVersion,
		Resource: kdlprojectResource,
	})
	c := New(logger, cfg, clientset, userToolsRes, kdlprojectRes)

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
