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
	slugUsername                     = "test-username"
	resName                          = "usertools-test-username"
	minioAccessKey                   = "user-test-username"
	minioSecretKey                   = "username123"
	runtimeID                        = "test-runtime-id"
	runtimeImage                     = "test-runtime-image"
	runtimeTag                       = "test-runtime-tag"
	configMapKdlUserToolTemplateName = "kdl-server-user-tools-template"
)

var userToolsData = k8s.UserToolsData{
	Username:     username,
	SlugUsername: slugUsername,
	RuntimeID:    runtimeID,
	RuntimeImage: runtimeImage,
	RuntimeTag:   runtimeTag,
}
var dataWithCapabilities = k8s.UserToolsData{
	Username:     username,
	SlugUsername: slugUsername,
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
	MinioAccessKey: entity.MinioAccessKey{
		AccessKey: minioAccessKey,
		SecretKey: minioSecretKey,
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
    env: {}
  nodeSelector: {}
  tolerations: []
  affinity: {}
  podLabels:
    runtimeId: my-demo-runtime-id
    capabilityId: my-demo-capabilities-id
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

	err := s.Client.CreateKDLUserToolsCR(ctx, dataWithCapabilities)
	s.Require().NoError(err)

	// Retrieve the Custom Resource
	resource, err := s.Client.GetKDLUserToolsCR(context.Background(), resName)
	s.Require().NoError(err)

	// Check its data
	spec, _ := resource.Object["spec"].(map[string]interface{})
	vscodeRuntime, _ := spec["vscodeRuntime"].(map[string]interface{})
	image, _ := vscodeRuntime["image"].(map[string]interface{})
	env, _ := vscodeRuntime["env"].(map[string]interface{})
	podLabels, _ := spec["podLabels"].(map[string]interface{})
	affinity, _ := spec["affinity"].(map[string]interface{})
	tolerations, _ := spec["tolerations"].([]interface{})
	toleration, _ := tolerations[0].(map[string]interface{})

	s.Require().Equal(runtimeImage, image["repository"])
	s.Require().Equal(runtimeTag, image["tag"])
	s.Require().Equal(runtimeID, podLabels["runtimeId"])
	s.Require().Equal("test-capability-id", podLabels["capabilityId"])
	s.Require().Equal(minioAccessKey, env["AWS_ACCESS_KEY_ID"])
	s.Require().Equal(minioSecretKey, env["AWS_SECRET_ACCESS_KEY"])
	s.Require().Equal("value", affinity["key"])
	s.Require().Equal("Equal", toleration["operator"])
	s.Require().Equal("value1", toleration["value"])
	s.Require().Equal("NoExecute", toleration["effect"])
	s.Require().Equal(int64(100), toleration["tolerationSeconds"])

	// Check the input data itself is stored as well
	specInputData, _ := spec["inputData"].(map[string]interface{})
	inputData, _ := s.Client.MapToUserToolsData(specInputData)
	s.Require().Equal(username, inputData.Username)
	s.Require().Equal(slugUsername, inputData.SlugUsername)
	s.Require().Equal(runtimeID, inputData.RuntimeID)
	s.Require().Equal(runtimeImage, inputData.RuntimeImage)
	s.Require().Equal(runtimeTag, inputData.RuntimeTag)
	s.Require().Equal(minioAccessKey, inputData.MinioAccessKey.AccessKey)
	s.Require().Equal(minioSecretKey, inputData.MinioAccessKey.SecretKey)

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
	err := s.Client.CreateKDLUserToolsCR(context.Background(), userToolsData)
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

	err = s.Client.CreateKDLUserToolsCR(context.Background(), userToolsData)
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

	err = s.Client.CreateKDLUserToolsCR(context.Background(), userToolsData)
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

	err = s.Client.CreateKDLUserToolsCR(context.Background(), userToolsData)
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

	err = s.Client.CreateKDLUserToolsCR(context.Background(), userToolsData)
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

	err = s.Client.CreateKDLUserToolsCR(context.Background(), userToolsData)
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

	err = s.Client.CreateKDLUserToolsCR(context.Background(), userToolsData)
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
    env: {}
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

	err = s.Client.CreateKDLUserToolsCR(context.Background(), dataWithCapabilities)
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
    env: {}
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

	err = s.Client.CreateKDLUserToolsCR(context.Background(), dataWithCapabilities)
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
    env: {}
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

	err = s.Client.CreateKDLUserToolsCR(context.Background(), dataWithCapabilities)
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
    env: {}
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

	err = s.Client.CreateKDLUserToolsCR(context.Background(), userToolsData)
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

	err := s.Client.CreateKDLUserToolsCR(ctx, dataWithCapabilities)
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

	err := s.Client.CreateKDLUserToolsCR(ctx, dataWithCapabilities)
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

	err := s.Client.CreateKDLUserToolsCR(ctx, dataWithCapabilities)
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
				"env": map[string]interface{}{},
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
	err = s.Client.UpdateKDLUserToolsCR(context.Background(), resName, &crd)
	s.Require().NoError(err)

	// Retrieve the Custom Resource
	resource, err := s.Client.GetKDLUserToolsCR(context.Background(), resName)
	s.Require().NoError(err)

	// Check the data is still there, in spite of the template update
	spec, _ := resource.Object["spec"].(map[string]interface{})
	vscodeRuntime, _ := spec["vscodeRuntime"].(map[string]interface{})
	image, _ := vscodeRuntime["image"].(map[string]interface{})
	env, _ := vscodeRuntime["env"].(map[string]interface{})
	podLabels, _ := spec["podLabels"].(map[string]interface{})
	affinity, _ := spec["affinity"].(map[string]interface{})
	tolerations, _ := spec["tolerations"].([]interface{})
	toleration, _ := tolerations[0].(map[string]interface{})

	s.Require().Equal(runtimeImage, image["repository"])
	s.Require().Equal(runtimeTag, image["tag"])
	s.Require().Equal(runtimeID, podLabels["runtimeId"])
	s.Require().Equal("test-capability-id", podLabels["capabilityId"])
	s.Require().Equal(minioAccessKey, env["AWS_ACCESS_KEY_ID"])
	s.Require().Equal(minioSecretKey, env["AWS_SECRET_ACCESS_KEY"])
	s.Require().Equal("value", affinity["key"])
	s.Require().Equal("Equal", toleration["operator"])
	s.Require().Equal("value1", toleration["value"])
	s.Require().Equal("NoExecute", toleration["effect"])
	s.Require().Equal(int64(100), toleration["tolerationSeconds"])

	// Check the input data itself is stored as well

	specInputData, _ := spec["inputData"].(map[string]interface{})
	inputData, _ := s.Client.MapToUserToolsData(specInputData)
	s.Require().Equal(username, inputData.Username)
	s.Require().Equal(slugUsername, inputData.SlugUsername)
	s.Require().Equal(runtimeID, inputData.RuntimeID)
	s.Require().Equal(runtimeImage, inputData.RuntimeImage)
	s.Require().Equal(runtimeTag, inputData.RuntimeTag)
	s.Require().Equal(minioAccessKey, inputData.MinioAccessKey.AccessKey)
	s.Require().Equal(minioSecretKey, inputData.MinioAccessKey.SecretKey)

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

func (s *testSuite) createPod(podName string) {
	_, err := s.Clientset.CoreV1().Pods(namespace).Create(context.Background(), &v1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			Name: podName,
			Labels: map[string]string{
				"app.kubernetes.io/instance": resName,
			},
		},
		Spec: v1.PodSpec{
			Containers: []v1.Container{
				{
					Name:  "container",
					Image: "busybox",
				},
			},
		},
	}, metav1.CreateOptions{})
	s.Require().NoError(err)
}
func (s *testSuite) TestIsUserToolPODRunning() {
	s.createPod("pod-running-valid")

	running, err := s.Client.IsUserToolPODRunning(context.Background(), slugUsername)
	s.Require().NoError(err)
	s.Require().True(running)
}

func (s *testSuite) TestIsUserToolPODRunning_PodNotFound() {
	s.createPod("pod-running-invalid")

	running, err := s.Client.IsUserToolPODRunning(context.Background(), "not-found-username")
	s.Require().Error(err)
	s.Require().False(running)
}

func (s *testSuite) TestGetUserToolsPodStatus() {
	s.createPod("pod-status")

	status, err := s.Client.GetUserToolsPodStatus(context.Background(), slugUsername)
	s.Require().NoError(err)
	s.Require().Equal(entity.PodStatusPending, status)
}

func (s *testSuite) TestGetUserToolsPodStatus_PodNotFound() {
	s.createPod("pod-status-failed")

	status, err := s.Client.GetUserToolsPodStatus(context.Background(), "failed-username")
	s.Require().Error(err)
	s.Require().Equal(entity.PodStatusFailed, status)
}
