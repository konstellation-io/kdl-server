//go:build integration

package k8s_test

import (
	"context"

	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

const (
	saSimpleName = "sa"
	saName       = "sa-service-account"
	saSecretName = "sa-service-account-secret" //nolint:gosec //this is a test
)

func (s *testSuite) TestCreateServiceAccount() {
	_, err := s.Client.CreateUserServiceAccount(context.Background(), saSimpleName)
	s.Require().NoError(err)

	serviceAccount := s.Clientset.CoreV1().ServiceAccounts(saSimpleName)
	s.NotNil(serviceAccount)

	sa, err := s.Client.GetUserServiceAccount(context.Background(), saSimpleName)
	s.Require().NoError(err)

	s.True(*sa.AutomountServiceAccountToken)
	s.Equal(saSecretName, sa.Secrets[0].Name)

	_, err = s.Client.GetSecret(context.Background(), sa.Secrets[0].Name)
	s.Require().NoError(err)
}

func (s *testSuite) TestCreateServiceAccountOnExistingSaWithoutAutomount() {
	// Arrange, create a service account without automount
	saNoAutomount, err := s.Clientset.CoreV1().ServiceAccounts(namespace).Create(context.Background(), &v1.ServiceAccount{
		ObjectMeta: metav1.ObjectMeta{
			Name: saName,
		},
	}, metav1.CreateOptions{})
	s.Require().NoError(err)
	s.NotNil(saNoAutomount)
	s.Nil(saNoAutomount.AutomountServiceAccountToken)
	s.Empty(saNoAutomount.Secrets)

	// Act
	_, err = s.Client.CreateUserServiceAccount(context.Background(), saSimpleName)
	s.Require().NoError(err)

	serviceAccount := s.Clientset.CoreV1().ServiceAccounts(saSimpleName)
	s.NotNil(serviceAccount)

	sa, err := s.Client.GetUserServiceAccount(context.Background(), saSimpleName)
	s.Require().NoError(err)

	s.True(*sa.AutomountServiceAccountToken)
	s.Equal(saSecretName, sa.Secrets[0].Name)

	_, err = s.Client.GetSecret(context.Background(), sa.Secrets[0].Name)
	s.Require().NoError(err)
}
