//go:build integration

package k8s_test

import (
	"context"
	"testing"

	"github.com/konstellation-io/kdl-server/app/api/infrastructure/k8s"

	"github.com/stretchr/testify/suite"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

const (
	saSimpleName                 = "sa"
	saSimpleNameWithoutAutomount = "sawa"
	saName                       = "sa-service-account"
	saNameWithoutAutomount       = "sawa-service-account"
	//nolint:gosec //this is a test
	saSecretName                 = "sa-service-account-secret"
	saSecretNameWithoutAutomount = "sawa-service-account-secret"
)

type serviceAccountTestSuite struct {
	k8s.TestSuite
}

func TestServiceAccountSuite(t *testing.T) {
	suite.Run(t, new(serviceAccountTestSuite))
}

func (s *serviceAccountTestSuite) TestCreateServiceAccount() {
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

func (s *serviceAccountTestSuite) TestCreateServiceAccountOnExistingSaWithoutAutomount() {
	// Arrange, create a service account without automount
	saNoAutomount, err := s.Clientset.CoreV1().ServiceAccounts(k8s.Namespace).Create(context.Background(), &v1.ServiceAccount{
		ObjectMeta: metav1.ObjectMeta{
			Name: saNameWithoutAutomount,
		},
	}, metav1.CreateOptions{})
	s.Require().NoError(err)
	s.NotNil(saNoAutomount)
	s.Nil(saNoAutomount.AutomountServiceAccountToken)
	s.Empty(saNoAutomount.Secrets)

	// Act
	_, err = s.Client.CreateUserServiceAccount(context.Background(), saSimpleNameWithoutAutomount)
	s.Require().NoError(err)

	serviceAccount := s.Clientset.CoreV1().ServiceAccounts(saSimpleNameWithoutAutomount)
	s.NotNil(serviceAccount)

	sa, err := s.Client.GetUserServiceAccount(context.Background(), saSimpleNameWithoutAutomount)
	s.Require().NoError(err)

	s.True(*sa.AutomountServiceAccountToken)
	s.Equal(saSecretNameWithoutAutomount, sa.Secrets[0].Name)

	_, err = s.Client.GetSecret(context.Background(), sa.Secrets[0].Name)
	s.Require().NoError(err)
}
