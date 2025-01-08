//go:build integration

package k8s_test

import (
	"context"

	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

const (
	configMapName      = "configmap"
	configMapDataKey   = "key"
	configMapDataValue = "value"
)

func (s *testSuite) TestGetConfigMap() {
	// Find the configmap in the namespace
	configMap, err := s.Client.GetConfigMap(context.Background(), configMapName)

	// Assert that the configmap is not found
	s.Require().Error(err)
	s.Require().Nil(configMap)

	// Arrange a configmap
	_, err = s.Clientset.CoreV1().ConfigMaps(namespace).Create(
		context.Background(), &v1.ConfigMap{
			ObjectMeta: metav1.ObjectMeta{
				Name: configMapName,
			},
			Data: map[string]string{
				configMapDataKey: configMapDataValue,
			},
		},
		metav1.CreateOptions{},
	)
	s.Require().NoError(err)

	// Act
	configMap, err = s.Client.GetConfigMap(context.Background(), configMapName)

	// Assert
	s.Require().NoError(err)
	s.Require().NotNil(configMap)
	s.Require().Equal(configMapName, configMap.Name)
}

func (s *testSuite) TestCreateConfigMapWatcher() {
	// Arrange a configmap
	_, err := s.Clientset.CoreV1().ConfigMaps(namespace).Create(
		context.Background(), &v1.ConfigMap{
			ObjectMeta: metav1.ObjectMeta{
				Name: configMapName,
				Labels: map[string]string{
					"kdl-server/component": "server",
				},
			},
			Data: map[string]string{
				configMapDataKey: configMapDataValue,
			},
		},
		metav1.CreateOptions{},
	)
	s.Require().NoError(err)

	watcher, err := s.Client.CreateConfigMapWatcher(context.Background())
	s.Require().NoError(err)
	s.Require().NotNil(watcher)
}
