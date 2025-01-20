//go:build integration

package k8s_test

import (
	"context"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/k8s"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

const (
	projectID               = "test-project-id"
	configMapKdlProjectName = "kdl-server-project-template"
)

var projectData = k8s.ProjectData{
	ProjectID: projectID,
	MinioAccessKey: entity.MinioAccessKey{
		AccessKey: minioAccessKey,
		SecretKey: minioSecretKey,
	},
}

func (s *testSuite) createKDLProjectConfigMapTemplate() {
	yamlContent := `
apiVersion: kdl.konstellation.io/v1
kind: KDLProject
metadata:
  generation: 1
  labels:
    app: kdl
  name: my-demo-name
  namespace: my-demo-namespace
spec:
  projectId: my-demo-projectId
  mlflow:
    env:
      ARTIFACTS_BUCKET: my-demo-bucket
  filebrowser:
    env: {}
`
	_, err := s.Clientset.CoreV1().ConfigMaps(namespace).Create(
		context.Background(), &v1.ConfigMap{
			ObjectMeta: metav1.ObjectMeta{
				Name: configMapKdlProjectName,
			},
			Data: map[string]string{
				"template": yamlContent,
			},
		},
		metav1.CreateOptions{},
	)
	s.Require().NoError(err)
}

func (s *testSuite) TestCreateKDLProjectCR_and_DeleteKDLProjectCR() {
	s.createKDLProjectConfigMapTemplate()

	err := s.Client.CreateKDLProjectCR(context.Background(), projectData)
	s.Require().NoError(err)

	// Delete the CR
	err = s.Client.DeleteKDLProjectCR(context.Background(), projectID)
	s.Require().NoError(err)
}

func (s *testSuite) TestCreateKDLProjectCR_NoConfigMap() {
	err := s.Client.CreateKDLProjectCR(context.Background(), projectData)
	s.Require().Error(err)
}

func (s *testSuite) TestCreateKDLProjectCR_ConfigMapWithoutSpec() {
	yamlContent := `
apiVersion: kdl.konstellation.io/v1
kind: KDLProject
metadata:
  generation: 1
  labels:
    app: kdl
  name: my-demo-name
  namespace: my-demo-namespace
`
	_, err := s.Clientset.CoreV1().ConfigMaps(namespace).Create(
		context.Background(), &v1.ConfigMap{
			ObjectMeta: metav1.ObjectMeta{
				Name: configMapKdlProjectName,
			},
			Data: map[string]string{
				"template": yamlContent,
			},
		},
		metav1.CreateOptions{},
	)
	s.Require().NoError(err)

	err = s.Client.CreateKDLProjectCR(context.Background(), projectData)
	s.Require().Error(err)
}

func (s *testSuite) TestCreateKDLProjectCR_ConfigMapWithoutMetadata() {
	yamlContent := `
apiVersion: kdl.konstellation.io/v1
kind: KDLProject
spec:
  projectId: my-demo-projectId
  mlflow:
    env:
      ARTIFACTS_BUCKET: my-demo-bucket
`
	_, err := s.Clientset.CoreV1().ConfigMaps(namespace).Create(
		context.Background(), &v1.ConfigMap{
			ObjectMeta: metav1.ObjectMeta{
				Name: configMapKdlProjectName,
			},
			Data: map[string]string{
				"template": yamlContent,
			},
		},
		metav1.CreateOptions{},
	)
	s.Require().NoError(err)

	err = s.Client.CreateKDLProjectCR(context.Background(), projectData)
	s.Require().Error(err)
}

func (s *testSuite) TestCreateKDLProjectCR_ConfigMapWithoutSpecMlflow() {
	yamlContent := `
apiVersion: kdl.konstellation.io/v1
kind: KDLProject
metadata:
  generation: 1
  labels:
    app: kdl
  name: my-demo-name
  namespace: my-demo-namespace
spec:
  projectId: my-demo-projectId
`
	_, err := s.Clientset.CoreV1().ConfigMaps(namespace).Create(
		context.Background(), &v1.ConfigMap{
			ObjectMeta: metav1.ObjectMeta{
				Name: configMapKdlProjectName,
			},
			Data: map[string]string{
				"template": yamlContent,
			},
		},
		metav1.CreateOptions{},
	)
	s.Require().NoError(err)

	err = s.Client.CreateKDLProjectCR(context.Background(), projectData)
	s.Require().Error(err)
}

func (s *testSuite) TestCreateKDLProjectCR_ConfigMapWithoutSpecMlflowEnv() {
	yamlContent := `
apiVersion: kdl.konstellation.io/v1
kind: KDLProject
metadata:
  generation: 1
  labels:
    app: kdl
  name: my-demo-name
  namespace: my-demo-namespace
spec:
  projectId: my-demo-projectId
  mlflow:
    environment:
      ARTIFACTS_BUCKET: my-demo-bucket
`
	_, err := s.Clientset.CoreV1().ConfigMaps(namespace).Create(
		context.Background(), &v1.ConfigMap{
			ObjectMeta: metav1.ObjectMeta{
				Name: configMapKdlProjectName,
			},
			Data: map[string]string{
				"template": yamlContent,
			},
		},
		metav1.CreateOptions{},
	)
	s.Require().NoError(err)

	err = s.Client.CreateKDLProjectCR(context.Background(), projectData)
	s.Require().Error(err)
}

func (s *testSuite) TestListKDLProjectsNameCR() {
	// Arrange by creating the CR
	s.createKDLProjectConfigMapTemplate()
	err := s.Client.CreateKDLProjectCR(context.Background(), projectData)
	s.Require().NoError(err)

	// Assert the CR exists
	projects, err := s.Client.ListKDLProjectsNameCR(context.Background())
	s.Require().NoError(err)
	s.Require().Len(projects, 1)
	s.Require().Equal(projectID, projects[0])

	// Delete the CR
	err = s.Client.DeleteKDLProjectCR(context.Background(), projectID)
	s.Require().NoError(err)
}

func (s *testSuite) TestListKDLProjectsNameCR_EmptyList() {
	// Assert the CR does not exist
	projects, err := s.Client.ListKDLProjectsNameCR(context.Background())
	s.Require().NoError(err)
	s.Require().Len(projects, 0)
}

func (s *testSuite) TestGetKDLProjectCR() {
	// Arrange by creating the CR
	s.createKDLProjectConfigMapTemplate()
	err := s.Client.CreateKDLProjectCR(context.Background(), projectData)
	s.Require().NoError(err)

	// Assert the CR exists
	crd, err := s.Client.GetKDLProjectCR(context.Background(), projectID)
	s.Require().NoError(err)
	s.Require().NotNil(crd)

	// Delete the CR
	err = s.Client.DeleteKDLProjectCR(context.Background(), projectID)
	s.Require().NoError(err)
}

func (s *testSuite) TestGetKDLProjectCR_Empty() {
	// Assert the CR does not exist
	crd, err := s.Client.GetKDLProjectCR(context.Background(), projectID)
	s.Require().Error(err)
	s.Require().Nil(crd)
}

func (s *testSuite) TestUpdateKDLProjectsCR() {
	// Arrange by creating the CR
	s.createKDLProjectConfigMapTemplate()
	err := s.Client.CreateKDLProjectCR(context.Background(), projectData)
	s.Require().NoError(err)

	// Update the CR
	crd := map[string]interface{}{
		"spec": map[string]interface{}{
			"projectId": "my-demo-projectId",
			"mlflow": map[string]interface{}{
				"env": map[string]interface{}{
					"ARTIFACTS_BUCKET": "my-demo-bucket",
				},
			},
			"filebrowser": map[string]interface{}{
				"env": map[string]interface{}{},
			},
		},
		"metadata": map[string]interface{}{
			"name":      "my-demo-name",
			"namespace": "my-demo-namespace",
		},
	}
	err = s.Client.UpdateKDLProjectsCR(context.Background(), projectID, &crd)
	s.Require().NoError(err)

	// Delete the CR
	err = s.Client.DeleteKDLProjectCR(context.Background(), projectID)
	s.Require().NoError(err)
}

func (s *testSuite) TestUpdateKDLProjectsCR_WithoutSpec() {
	// Assert the CR does not exist
	crd := map[string]interface{}{}
	err := s.Client.UpdateKDLProjectsCR(context.Background(), projectID, &crd)
	s.Require().Error(err)
}

func (s *testSuite) TestUpdateKDLProjectsCR_WithoutCRD() {
	// Assert the CR does not exist
	crd := map[string]interface{}{
		"spec": map[string]interface{}{},
	}
	err := s.Client.UpdateKDLProjectsCR(context.Background(), projectID, &crd)
	s.Require().Error(err)
}
