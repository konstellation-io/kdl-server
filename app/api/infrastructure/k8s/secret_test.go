//go:build integration

package k8s_test

import (
	"context"
	"testing"

	"github.com/konstellation-io/kdl-server/app/api/infrastructure/k8s"
	"github.com/stretchr/testify/suite"
)

const (
	secretCreateName = "secret-create"
	secretGetName    = "secret-get"
	secretUpdateName = "secret-update"
)

var (
	secretData = map[string]string{"key": "value"}
	labels     = map[string]string{"label": "value"}
)

type secretTestSuite struct {
	k8s.TestSuite
}

func TestSecretSuite(t *testing.T) {
	suite.Run(t, new(secretTestSuite))
}

func (s *secretTestSuite) TestCreateSecret() {
	// Create a secret
	err := s.Client.CreateSecret(context.Background(), secretCreateName, secretData, labels)
	s.Require().NoError(err)
}

func (s *secretTestSuite) TestUpdateSecret() {
	// Create a secret
	err := s.Client.CreateSecret(context.Background(), secretUpdateName, secretData, labels)
	s.Require().NoError(err)

	// Assert secret exists
	data, err := s.Client.GetSecret(context.Background(), secretUpdateName)
	s.Require().NoError(err)
	s.Require().Equal("value", string(data["key"]))

	// Update secret
	err = s.Client.UpdateSecret(context.Background(), secretUpdateName, map[string]string{"key": "new-value"}, labels)
	s.Require().NoError(err)

	// Assert secret is updated
	data, err = s.Client.GetSecret(context.Background(), secretUpdateName)
	s.Require().NoError(err)
	s.Require().Equal("new-value", string(data["key"]))
}

func (s *secretTestSuite) TestGetSecret() {
	// Create a secret
	err := s.Client.CreateSecret(context.Background(), secretGetName, secretData, labels)
	s.Require().NoError(err)

	// Assert secret exists
	data, err := s.Client.GetSecret(context.Background(), secretGetName)
	s.Require().NoError(err)
	s.Require().Equal("value", string(data["key"]))
}
