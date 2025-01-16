//go:build integration

package k8s_test

import (
	"context"
	"testing"

	"github.com/konstellation-io/kdl-server/app/api/infrastructure/config"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/k8s"

	"github.com/go-logr/zapr"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go/modules/k3s"
	"go.uber.org/zap"
	v1 "k8s.io/api/core/v1"
	apiextensionsv1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
	apiextensionsclient "k8s.io/apiextensions-apiserver/pkg/client/clientset/clientset"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
)

const (
	namespace   = "kdl-test"
	releaseName = "kdl"

	kdlUserToolsGroup      = "kdl.konstellation.io"
	kdlUserToolsResource   = "kdlusertools"
	kdlUserToolsVersion    = "v1"
	kdlUserToolsAPIVersion = kdlUserToolsGroup + "/" + kdlUserToolsVersion

	kdlProjectGroup      = "kdl.konstellation.io"
	kdlProjectResource   = "kdlprojects"
	kdlProjectVersion    = "v1"
	kdlProjectAPIVersion = kdlProjectGroup + "/" + kdlProjectVersion
)

type testSuite struct {
	suite.Suite
	Container       *k3s.K3sContainer
	Client          *k8s.Client
	Clientset       *kubernetes.Clientset
	kdlUserToolsRes dynamic.NamespaceableResourceInterface
	kdlProjectRes   dynamic.NamespaceableResourceInterface
}

func TestSuite(t *testing.T) {
	suite.Run(t, new(testSuite))
}

func (s *testSuite) defineCRD(restcfg *rest.Config) {
	// Create a clientset for CRD operations
	apiExtensionsClient, err := apiextensionsclient.NewForConfig(restcfg)
	s.Require().NoError(err)

	// Define the CRD for KDLUserTools
	preserve := true
	crdKdlUserTools := &apiextensionsv1.CustomResourceDefinition{
		ObjectMeta: metav1.ObjectMeta{
			Name: "kdlusertools.kdl.konstellation.io", // Format: plural.group
		},
		Spec: apiextensionsv1.CustomResourceDefinitionSpec{
			Group: "kdl.konstellation.io",
			Names: apiextensionsv1.CustomResourceDefinitionNames{
				Plural:   "kdlusertools",
				Singular: "kdlusertool",
				Kind:     "KDLUserTools",
				ListKind: "KDLUserToolsList",
			},
			Scope: apiextensionsv1.NamespaceScoped,
			Versions: []apiextensionsv1.CustomResourceDefinitionVersion{
				{
					Name:    "v1",
					Served:  true,
					Storage: true,
					Schema: &apiextensionsv1.CustomResourceValidation{
						OpenAPIV3Schema: &apiextensionsv1.JSONSchemaProps{
							Type: "object",
							Properties: map[string]apiextensionsv1.JSONSchemaProps{
								"spec": {
									Type: "object",
									Properties: map[string]apiextensionsv1.JSONSchemaProps{
										"username":     {Type: "string"},
										"usernameSlug": {Type: "string"},
										"vscodeRuntime": {
											Type: "object",
											Properties: map[string]apiextensionsv1.JSONSchemaProps{
												"env": {
													Type:                   "object",
													Properties:             map[string]apiextensionsv1.JSONSchemaProps{},
													XPreserveUnknownFields: &preserve,
												},
											},
										},
									},
								},
							},
						},
					},
				},
			},
		},
	}

	// Create the CRD KDLUserTools in the cluster
	_, err = apiExtensionsClient.ApiextensionsV1().CustomResourceDefinitions().Create(context.TODO(), crdKdlUserTools, metav1.CreateOptions{})
	s.Require().NoError(err)

	// Define the CRD for KDLProject
	crdKdlProject := &apiextensionsv1.CustomResourceDefinition{
		ObjectMeta: metav1.ObjectMeta{
			Name: "kdlprojects.kdl.konstellation.io", // Format: plural.group
		},
		Spec: apiextensionsv1.CustomResourceDefinitionSpec{
			Group: "kdl.konstellation.io",
			Names: apiextensionsv1.CustomResourceDefinitionNames{
				Plural:   "kdlprojects",
				Singular: "kdlproject",
				Kind:     "KDLProject",
				ListKind: "KDLProjectList",
			},
			Scope: apiextensionsv1.NamespaceScoped,
			Versions: []apiextensionsv1.CustomResourceDefinitionVersion{
				{
					Name:    "v1",
					Served:  true,
					Storage: true,
					Schema: &apiextensionsv1.CustomResourceValidation{
						OpenAPIV3Schema: &apiextensionsv1.JSONSchemaProps{
							Type: "object",
							Properties: map[string]apiextensionsv1.JSONSchemaProps{
								"spec": {
									Type: "object",
									Properties: map[string]apiextensionsv1.JSONSchemaProps{
										"projectId": {
											Type: "string",
										},
									},
									Required: []string{"projectId"},
								},
							},
							Required: []string{"spec"},
						},
					},
				},
			},
		},
	}

	// Create the CRD KDLProject in the cluster
	_, err = apiExtensionsClient.ApiextensionsV1().CustomResourceDefinitions().Create(context.TODO(), crdKdlProject, metav1.CreateOptions{})
	s.Require().NoError(err)
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
		ReleaseName: releaseName,
		Kubernetes: config.KubernetesConfig{
			IsInsideCluster: true,
			Namespace:       namespace,
		},
	}

	dynamicClient, err := dynamic.NewForConfig(restcfg)
	s.Require().NoError(err)

	s.kdlUserToolsRes = dynamicClient.Resource(schema.GroupVersionResource{
		Group:    kdlUserToolsGroup,
		Version:  kdlUserToolsVersion,
		Resource: kdlUserToolsResource,
	})

	s.kdlProjectRes = dynamicClient.Resource(schema.GroupVersionResource{
		Group:    kdlProjectGroup,
		Version:  kdlProjectVersion,
		Resource: kdlProjectResource,
	})

	s.defineCRD(restcfg)

	// Create the client
	s.Client = k8s.New(
		logger,
		cfg,
		s.Clientset,
		s.kdlUserToolsRes,
		s.kdlProjectRes,
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

	err = s.Clientset.CoreV1().ConfigMaps(namespace).DeleteCollection(context.Background(), metav1.DeleteOptions{}, metav1.ListOptions{})
	s.Require().NoError(err)

	//err = s.kdlUserToolsRes.DeleteCollection(context.Background(), metav1.DeleteOptions{}, metav1.ListOptions{})
	//s.Require().NoError(err)
}
