//go:build integration

package k8s_test

import (
	"context"

	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

const (
	projectID               = "test-project-id"
	configMapKdlProjectName = "kdl-server-project-template"
)

func (s *testSuite) TestCreateKDLProjectCR_and_DeleteKDLProjectCR() {
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

	err = s.Client.CreateKDLProjectCR(context.Background(), projectID)
	s.Require().NoError(err)

	// Delete the CR
	err = s.Client.DeleteKDLProjectCR(context.Background(), projectID)
	s.Require().NoError(err)
}

func (s *testSuite) TestCreateKDLProjectCR_NoConfigMap() {
	err := s.Client.CreateKDLProjectCR(context.Background(), projectID)
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

	err = s.Client.CreateKDLProjectCR(context.Background(), projectID)
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

	err = s.Client.CreateKDLProjectCR(context.Background(), projectID)
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

	err = s.Client.CreateKDLProjectCR(context.Background(), projectID)
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

	err = s.Client.CreateKDLProjectCR(context.Background(), projectID)
	s.Require().Error(err)
}
