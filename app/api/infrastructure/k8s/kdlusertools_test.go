//go:build integration

package k8s_test

import (
	"context"
	"encoding/json"
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
	resource, err := s.kdlUserToolsRes.Namespace(namespace).Get(context.Background(), resName, metav1.GetOptions{})
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
	inputData, _ := spec["inputData"].(map[string]interface{})
	inputUserName, _ := inputData["username"].(string)
	inputSlugUserName, _ := inputData["slugUsername"].(string)
	inputRuntimeID, _ := inputData["runtimeID"].(string)
	inputRuntimeImage, _ := inputData["runtimeImage"].(string)
	inputRuntimeTag, _ := inputData["runtimeTag"].(string)

	s.Require().Equal(username, inputUserName)
	s.Require().Equal(slugUsername, inputSlugUserName)
	s.Require().Equal(runtimeID, inputRuntimeID)
	s.Require().Equal(runtimeImage, inputRuntimeImage)
	s.Require().Equal(runtimeTag, inputRuntimeTag)

	var decodedMinioAccessKey entity.MinioAccessKey

	inputMinioAccessKey, _ := inputData["minioAccessKey"].(string)

	err = json.Unmarshal([]byte(inputMinioAccessKey), &decodedMinioAccessKey)
	s.Require().NoError(err)

	s.Require().Equal(minioAccessKey, decodedMinioAccessKey.AccessKey)
	s.Require().Equal(minioSecretKey, decodedMinioAccessKey.SecretKey)

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
	resource, err := s.kdlUserToolsRes.Namespace(namespace).Get(context.Background(), resName, metav1.GetOptions{})
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
