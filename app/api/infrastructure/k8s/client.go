package k8s

import (
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/config"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
)

const (
	userToolsGroup    = "sci-toolkit.konstellation.io"
	userToolsResource = "usertools"
	userToolsVersion  = "v1alpha1"
	apiVersion        = userToolsGroup + "/" + userToolsVersion
)

type k8sClient struct {
	logger     logging.Logger
	cfg        config.Config
	clientset  *kubernetes.Clientset
	codeClient dynamic.NamespaceableResourceInterface
}

func NewK8sClient(logger logging.Logger, cfg config.Config) (K8sClient, error) {
	kubeConfig, err := rest.InClusterConfig()
	if err != nil {
		return nil, err
	}

	clientset, err := kubernetes.NewForConfig(kubeConfig)
	if err != nil {
		return nil, err
	}

	dynamicClient, err := dynamic.NewForConfig(kubeConfig)
	if err != nil {
		return nil, err
	}

	codeClient := dynamicClient.Resource(schema.GroupVersionResource{
		Group:    userToolsGroup,
		Version:  userToolsVersion,
		Resource: userToolsResource,
	})

	c := &k8sClient{
		logger:     logger,
		clientset:  clientset,
		cfg:        cfg,
		codeClient: codeClient,
	}

	return c, nil
}
