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
	resName                          = "usertools-test-username"
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

func (s *testSuite) createKDLUserToolsConfigMapTemplate() {
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
}

func (s *testSuite) TestCreateKDLUserToolsCR_and_DeleteUserToolsCR() {
	s.createKDLUserToolsConfigMapTemplate()
	// create go routine to cancel the context in 5 seconds. Risk of flaky test
	ctx, cancelCreateUserToolCR := context.WithCancel(context.Background())
	go func() {
		<-time.After(5 * time.Second)
		cancelCreateUserToolCR()
	}()

	err := s.Client.CreateKDLUserToolsCR(ctx, username, dataWithCapabilities)
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

func (s *testSuite) TestCreateKDLUserToolsCR_NoConfigMap() {
	err := s.Client.CreateKDLUserToolsCR(context.Background(), username, data)
	s.Require().Error(err)
}

func (s *testSuite) TestCreateKDLUserToolsCR_ConfigMapWithoutTemplate() {
	_, err := s.Clientset.CoreV1().ConfigMaps(namespace).Create(
		context.Background(), &v1.ConfigMap{
			ObjectMeta: metav1.ObjectMeta{
				Name: configMapKdlUserToolTemplateName,
			},
		},
		metav1.CreateOptions{},
	)
	s.Require().NoError(err)

	err = s.Client.CreateKDLUserToolsCR(context.Background(), username, data)
	s.Require().Error(err)
}

func (s *testSuite) TestCreateKDLUserToolsCR_TemplateWithoutMetadata() {
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

	err = s.Client.CreateKDLUserToolsCR(context.Background(), username, data)
	s.Require().Error(err)
}

func (s *testSuite) TestCreateKDLUserToolsCR_TemplateWithoutMetadataLabels() {
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

	err = s.Client.CreateKDLUserToolsCR(context.Background(), username, data)
	s.Require().Error(err)
}

func (s *testSuite) TestCreateKDLUserToolsCR_TemplateWithoutSpec() {
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

	err = s.Client.CreateKDLUserToolsCR(context.Background(), username, data)
	s.Require().Error(err)
}

func (s *testSuite) TestCreateKDLUserToolsCR_TemplateWithoutVscodeRuntime() {
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

	err = s.Client.CreateKDLUserToolsCR(context.Background(), username, data)
	s.Require().Error(err)
}

func (s *testSuite) TestCreateKDLUserToolsCR_TemplateWithoutVscodeRuntimeImage() {
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

	err = s.Client.CreateKDLUserToolsCR(context.Background(), username, data)
	s.Require().Error(err)
}

func (s *testSuite) TestCreateKDLUserToolsCR_TemplateWithoutSpecNodeSelector() {
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

	err = s.Client.CreateKDLUserToolsCR(context.Background(), username, dataWithCapabilities)
	s.Require().Error(err)
}

func (s *testSuite) TestCreateKDLUserToolsCR_TemplateWithoutSpecTolerations() {
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

	err = s.Client.CreateKDLUserToolsCR(context.Background(), username, dataWithCapabilities)
	s.Require().Error(err)
}

func (s *testSuite) TestCreateKDLUserToolsCR_TemplateWithoutAffinity() {
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

	err = s.Client.CreateKDLUserToolsCR(context.Background(), username, dataWithCapabilities)
	s.Require().Error(err)
}

func (s *testSuite) TestCreateKDLUserToolsCR_TemplateWithoutSpecPodLabels() {
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

	err = s.Client.CreateKDLUserToolsCR(context.Background(), username, data)
	s.Require().Error(err)
}

func (s *testSuite) TestListKDLUserToolsCR() {
	s.createKDLUserToolsConfigMapTemplate()
	// create go routine to cancel the context in 5 seconds. Risk of flaky test
	ctx, cancelCreateUserToolCR := context.WithCancel(context.Background())
	go func() {
		<-time.After(5 * time.Second)
		cancelCreateUserToolCR()
	}()

	err := s.Client.CreateKDLUserToolsCR(ctx, username, dataWithCapabilities)
	s.Require().NoError(err)

	// List the CR
	list, err := s.Client.ListKDLUserToolsCR(context.Background())
	s.Require().NoError(err)
	s.Require().Len(list, 1)

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

func (s *testSuite) TestListKDLUserToolsCR_Empty() {
	// List the CR
	list, err := s.Client.ListKDLUserToolsCR(context.Background())
	s.Require().NoError(err)
	s.Require().Len(list, 0)
}

func (s *testSuite) TestGetKDLUserToolsCR() {
	s.createKDLUserToolsConfigMapTemplate()
	// create go routine to cancel the context in 5 seconds. Risk of flaky test
	ctx, cancelCreateUserToolCR := context.WithCancel(context.Background())
	go func() {
		<-time.After(5 * time.Second)
		cancelCreateUserToolCR()
	}()

	err := s.Client.CreateKDLUserToolsCR(ctx, username, dataWithCapabilities)
	s.Require().NoError(err)

	// Get the CR
	item, err := s.Client.GetKDLUserToolsCR(context.Background(), resName)
	s.Require().NoError(err)
	s.Require().NotNil(item)

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

func (s *testSuite) TestGetKDLUserToolsCR_Empty() {
	// Get the CR
	item, err := s.Client.GetKDLUserToolsCR(context.Background(), resName)
	s.Require().Error(err)
	s.Require().Nil(item)
}

func (s *testSuite) TestUpdateKDLUserToolsCR() {
	s.createKDLUserToolsConfigMapTemplate()
	// create go routine to cancel the context in 5 seconds. Risk of flaky test
	ctx, cancelCreateUserToolCR := context.WithCancel(context.Background())
	go func() {
		<-time.After(5 * time.Second)
		cancelCreateUserToolCR()
	}()

	err := s.Client.CreateKDLUserToolsCR(ctx, username, dataWithCapabilities)
	s.Require().NoError(err)

	// Update the CR
	crd := map[string]interface{}{
		"spec": map[string]interface{}{
			"username":     "new-username",
			"usernameSlug": "new-username-slug",
			"vscodeRuntime": map[string]interface{}{
				"image": map[string]interface{}{
					"repository": "new-repo",
					"tag":        "new-tag",
				},
			},
			"podLabels": map[string]interface{}{
				"runtimeId":    "new-runtime-id",
				"capabilityId": "new-capabilities-id",
			},
		},
		"metadata": map[string]interface{}{
			"name": "new-res-name",
		},
	}
	err = s.Client.UpdateKDLUserToolsCR(context.Background(), resName, data, &crd)
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
