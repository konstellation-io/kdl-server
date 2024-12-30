//go:build integration

package k8s_test

import (
	"context"
	"time"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/k8s"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

const (
	username                         = "test.username"
	runtimeID                        = "test-runtime-id"
	runtimeImage                     = "test-runtime-image"
	runtimeTag                       = "test-runtime-tag"
	configMapKdlUserToolTemplateName = "kdl-server-user-tools-template"
)

var data = k8s.UserToolsData{
	RuntimeID:    runtimeID,
	RuntimeImage: runtimeImage,
	RuntimeTag:   runtimeTag,
}
var dataWithCapabilities = k8s.UserToolsData{
	RuntimeID:    runtimeID,
	RuntimeImage: runtimeImage,
	RuntimeTag:   runtimeTag,
	Capabilities: entity.Capabilities{
		ID:            "test-capability-id",
		Name:          "test-capability-name",
		Default:       false,
		NodeSelectors: map[string]string{"key": "value"},
		Tolerations: []map[string]interface{}{
			{
				"key":               "key1",
				"operator":          "Equal",
				"value":             "value1",
				"effect":            "NoExecute",
				"tolerationSeconds": 100,
			},
		},
		Affinities: map[string]interface{}{"key": "value"},
	},
}

func (s *testSuite) TestCreateUserToolsCR_and_DeleteUserToolsCR() {
	yamlContent := `
apiVersion: kdl.konstellation.io/v1
kind: KDLUserTools
metadata:
  labels:
    app: kdl
  name: my-demo-name
  namespace: my-demo-namespace
spec:
  username: my-demo-username
  usernameSlug: my-demo-username-slug
  vscodeRuntime:
    image:
       repository: my-demo-repository
       tag: my-demo-tag
  nodeSelector: {}
  tolerations: []
  affinity: {}
  podLabels:
    runtimeId: my-demo-runtime-id
    capabilitiesId: my-demo-capabilities-id
`
	_, err := s.Clientset.CoreV1().ConfigMaps(namespace).Create(
		context.Background(), &v1.ConfigMap{
			ObjectMeta: metav1.ObjectMeta{
				Name: configMapKdlUserToolTemplateName,
			},
			Data: map[string]string{
				"template": yamlContent,
			},
		},
		metav1.CreateOptions{},
	)
	s.Require().NoError(err)

	// create go routine to cancel the context in 5 seconds. Risk of flaky test
	ctx, cancelCreateUserToolCR := context.WithCancel(context.Background())
	go func() {
		<-time.After(5 * time.Second)
		cancelCreateUserToolCR()
	}()

	err = s.Client.CreateUserToolsCR(ctx, username, dataWithCapabilities)
	s.Require().NoError(err)

	// Delete the CR
	// create go routine to cancel the context in 5 seconds. Risk of flaky test
	ctx, cancelDeleteUserToolsCR := context.WithCancel(context.Background())
	go func() {
		<-time.After(5 * time.Second)
		cancelDeleteUserToolsCR()
	}()

	err = s.Client.DeleteUserToolsCR(ctx, username)
	s.Require().NoError(err)
}

func (s *testSuite) TestCreateUserToolsCR_NoConfigMap() {
	err := s.Client.CreateUserToolsCR(context.Background(), username, data)
	s.Require().Error(err)
}

func (s *testSuite) TestCreateUserToolsCR_ConfigMapWithoutTemplate() {
	_, err := s.Clientset.CoreV1().ConfigMaps(namespace).Create(
		context.Background(), &v1.ConfigMap{
			ObjectMeta: metav1.ObjectMeta{
				Name: configMapKdlUserToolTemplateName,
			},
		},
		metav1.CreateOptions{},
	)
	s.Require().NoError(err)

	err = s.Client.CreateUserToolsCR(context.Background(), username, data)
	s.Require().Error(err)
}

func (s *testSuite) TestCreateUserToolsCR_TemplateWithoutMetadata() {
	yamlContent := `
apiVersion: kdl.konstellation.io/v1
kind: KDLUserTools
`
	_, err := s.Clientset.CoreV1().ConfigMaps(namespace).Create(
		context.Background(), &v1.ConfigMap{
			ObjectMeta: metav1.ObjectMeta{
				Name: configMapKdlUserToolTemplateName,
			},
			Data: map[string]string{
				"template": yamlContent,
			},
		},
		metav1.CreateOptions{},
	)
	s.Require().NoError(err)

	err = s.Client.CreateUserToolsCR(context.Background(), username, data)
	s.Require().Error(err)
}

func (s *testSuite) TestCreateUserToolsCR_TemplateWithoutMetadataLabels() {
	yamlContent := `
apiVersion: kdl.konstellation.io/v1
kind: KDLUserTools
metadata:
  name: my-demo-name
  namespace: my-demo-namespace
`
	_, err := s.Clientset.CoreV1().ConfigMaps(namespace).Create(
		context.Background(), &v1.ConfigMap{
			ObjectMeta: metav1.ObjectMeta{
				Name: configMapKdlUserToolTemplateName,
			},
			Data: map[string]string{
				"template": yamlContent,
			},
		},
		metav1.CreateOptions{},
	)
	s.Require().NoError(err)

	err = s.Client.CreateUserToolsCR(context.Background(), username, data)
	s.Require().Error(err)
}

func (s *testSuite) TestCreateUserToolsCR_TemplateWithoutSpec() {
	yamlContent := `
apiVersion: kdl.konstellation.io/v1
kind: KDLUserTools
metadata:
  labels:
    app: kdl
  name: my-demo-name
  namespace: my-demo-namespace
`
	_, err := s.Clientset.CoreV1().ConfigMaps(namespace).Create(
		context.Background(), &v1.ConfigMap{
			ObjectMeta: metav1.ObjectMeta{
				Name: configMapKdlUserToolTemplateName,
			},
			Data: map[string]string{
				"template": yamlContent,
			},
		},
		metav1.CreateOptions{},
	)
	s.Require().NoError(err)

	err = s.Client.CreateUserToolsCR(context.Background(), username, data)
	s.Require().Error(err)
}

func (s *testSuite) TestCreateUserToolsCR_TemplateWithoutVscodeRuntime() {
	yamlContent := `
apiVersion: kdl.konstellation.io/v1
kind: KDLUserTools
metadata:
  labels:
    app: kdl
  name: my-demo-name
  namespace: my-demo-namespace
spec:
  username: my-demo-username
  usernameSlug: my-demo-username-slug
`
	_, err := s.Clientset.CoreV1().ConfigMaps(namespace).Create(
		context.Background(), &v1.ConfigMap{
			ObjectMeta: metav1.ObjectMeta{
				Name: configMapKdlUserToolTemplateName,
			},
			Data: map[string]string{
				"template": yamlContent,
			},
		},
		metav1.CreateOptions{},
	)
	s.Require().NoError(err)

	err = s.Client.CreateUserToolsCR(context.Background(), username, data)
	s.Require().Error(err)
}

func (s *testSuite) TestCreateUserToolsCR_TemplateWithoutVscodeRuntimeImage() {
	yamlContent := `
apiVersion: kdl.konstellation.io/v1
kind: KDLUserTools
metadata:
  labels:
    app: kdl
  name: my-demo-name
  namespace: my-demo-namespace
spec:
  username: my-demo-username
  usernameSlug: my-demo-username-slug
  vscodeRuntime: {}
`
	_, err := s.Clientset.CoreV1().ConfigMaps(namespace).Create(
		context.Background(), &v1.ConfigMap{
			ObjectMeta: metav1.ObjectMeta{
				Name: configMapKdlUserToolTemplateName,
			},
			Data: map[string]string{
				"template": yamlContent,
			},
		},
		metav1.CreateOptions{},
	)
	s.Require().NoError(err)

	err = s.Client.CreateUserToolsCR(context.Background(), username, data)
	s.Require().Error(err)
}

func (s *testSuite) TestCreateUserToolsCR_TemplateWithoutSpecNodeSelector() {
	yamlContent := `
apiVersion: kdl.konstellation.io/v1
kind: KDLUserTools
metadata:
  labels:
    app: kdl
  name: my-demo-name
  namespace: my-demo-namespace
spec:
  username: my-demo-username
  usernameSlug: my-demo-username-slug
  vscodeRuntime:
    image:
       repository: my-demo-repository
       tag: my-demo-tag
`
	_, err := s.Clientset.CoreV1().ConfigMaps(namespace).Create(
		context.Background(), &v1.ConfigMap{
			ObjectMeta: metav1.ObjectMeta{
				Name: configMapKdlUserToolTemplateName,
			},
			Data: map[string]string{
				"template": yamlContent,
			},
		},
		metav1.CreateOptions{},
	)
	s.Require().NoError(err)

	err = s.Client.CreateUserToolsCR(context.Background(), username, dataWithCapabilities)
	s.Require().Error(err)
}

func (s *testSuite) TestCreateUserToolsCR_TemplateWithoutSpecTolerations() {
	yamlContent := `
apiVersion: kdl.konstellation.io/v1
kind: KDLUserTools
metadata:
  labels:
    app: kdl
  name: my-demo-name
  namespace: my-demo-namespace
spec:
  username: my-demo-username
  usernameSlug: my-demo-username-slug
  vscodeRuntime:
    image:
       repository: my-demo-repository
       tag: my-demo-tag
  nodeSelector: {}
`
	_, err := s.Clientset.CoreV1().ConfigMaps(namespace).Create(
		context.Background(), &v1.ConfigMap{
			ObjectMeta: metav1.ObjectMeta{
				Name: configMapKdlUserToolTemplateName,
			},
			Data: map[string]string{
				"template": yamlContent,
			},
		},
		metav1.CreateOptions{},
	)
	s.Require().NoError(err)

	err = s.Client.CreateUserToolsCR(context.Background(), username, dataWithCapabilities)
	s.Require().Error(err)
}

func (s *testSuite) TestCreateUserToolsCR_TemplateWithoutAffinity() {
	yamlContent := `
apiVersion: kdl.konstellation.io/v1
kind: KDLUserTools
metadata:
  labels:
    app: kdl
  name: my-demo-name
  namespace: my-demo-namespace
spec:
  username: my-demo-username
  usernameSlug: my-demo-username-slug
  vscodeRuntime:
    image:
       repository: my-demo-repository
       tag: my-demo-tag
  nodeSelector: {}
  tolerations: []
`
	_, err := s.Clientset.CoreV1().ConfigMaps(namespace).Create(
		context.Background(), &v1.ConfigMap{
			ObjectMeta: metav1.ObjectMeta{
				Name: configMapKdlUserToolTemplateName,
			},
			Data: map[string]string{
				"template": yamlContent,
			},
		},
		metav1.CreateOptions{},
	)
	s.Require().NoError(err)

	err = s.Client.CreateUserToolsCR(context.Background(), username, dataWithCapabilities)
	s.Require().Error(err)
}

func (s *testSuite) TestCreateUserToolsCR_TemplateWithoutSpecPodLabels() {
	yamlContent := `
apiVersion: kdl.konstellation.io/v1
kind: KDLUserTools
metadata:
  labels:
    app: kdl
  name: my-demo-name
  namespace: my-demo-namespace
spec:
  username: my-demo-username
  usernameSlug: my-demo-username-slug
  vscodeRuntime:
    image:
       repository: my-demo-repository
       tag: my-demo-tag
  nodeSelector: {}
  tolerations: []
  affinity: {}
`
	_, err := s.Clientset.CoreV1().ConfigMaps(namespace).Create(
		context.Background(), &v1.ConfigMap{
			ObjectMeta: metav1.ObjectMeta{
				Name: configMapKdlUserToolTemplateName,
			},
			Data: map[string]string{
				"template": yamlContent,
			},
		},
		metav1.CreateOptions{},
	)
	s.Require().NoError(err)

	err = s.Client.CreateUserToolsCR(context.Background(), username, data)
	s.Require().Error(err)
}
