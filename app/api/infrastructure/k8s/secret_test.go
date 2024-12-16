//go:build integration

package k8s_test

import (
	"context"
)

const (
	secretName = "secret-create"
)

var (
	secretData = map[string]string{"key": "value"}
	labels     = map[string]string{"label": "value"}
)

func (s *testSuite) TestCreateSecret() {
	// Create a secret
	err := s.Client.CreateSecret(context.Background(), secretName, secretData, labels)
	s.Require().NoError(err)
}

func (s *testSuite) TestUpdateSecret() {
	// Create a secret
	err := s.Client.CreateSecret(context.Background(), secretName, secretData, labels)
	s.Require().NoError(err)

	// Assert secret exists
	data, err := s.Client.GetSecret(context.Background(), secretName)
	s.Require().NoError(err)
	s.Require().Equal("value", string(data["key"]))

	// Update secret
	err = s.Client.UpdateSecret(context.Background(), secretName, map[string]string{"key": "new-value"}, labels)
	s.Require().NoError(err)

	// Assert secret is updated
	data, err = s.Client.GetSecret(context.Background(), secretName)
	s.Require().NoError(err)
	s.Require().Equal("new-value", string(data["key"]))
}

func (s *testSuite) TestGetSecret() {
	// Create a secret
	err := s.Client.CreateSecret(context.Background(), secretName, secretData, labels)
	s.Require().NoError(err)

	// Assert secret exists
	data, err := s.Client.GetSecret(context.Background(), secretName)
	s.Require().NoError(err)
	s.Require().Equal("value", string(data["key"]))
}
