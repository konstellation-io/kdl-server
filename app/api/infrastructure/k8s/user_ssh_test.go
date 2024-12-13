//go:build integration

package k8s_test

import (
	"context"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/k8s"
)

const (
	userSSHName = "user"
	secretSSHName = "user-ssh-keys"
)
var user = entity.User{
	Username: userSSHName,
}

func (s *testSuite) TestCreateUserSSHKeySecret() {
	err := s.Client.CreateUserSSHKeySecret(context.Background(), user, "public-key", "private-key")
	s.Require().NoError(err)
}

func (s *testSuite) TestUpdateUserSSHKeySecret() {
	err := s.Client.CreateUserSSHKeySecret(context.Background(), user, "public-key", "private-key")
	s.Require().NoError(err)

	// Assert user ssh secret exists
	data, err := s.Client.GetSecret(context.Background(), secretSSHName)
	s.Require().NoError(err)
	s.Require().Equal("public-key", string(data[k8s.KdlUserPublicSSHKey]))
	s.Require().Equal("private-key", string(data[k8s.KdlUserPrivateSSHKey]))

	// Update user ssh key secret
	err = s.Client.UpdateUserSSHKeySecret(context.Background(), user, "new-public-key", "new-private-key")
	s.Require().NoError(err)

	// Assert user ssh secret is updated
	data, err = s.Client.GetSecret(context.Background(), secretSSHName)
	s.Require().NoError(err)
	s.Require().Equal("new-public-key", string(data[k8s.KdlUserPublicSSHKey]))
	s.Require().Equal("new-private-key", string(data[k8s.KdlUserPrivateSSHKey]))
}

func (s *testSuite) TestGetUserSSHKeySecret() {
	err := s.Client.CreateUserSSHKeySecret(context.Background(), user, "public-key", "private-key")
	s.Require().NoError(err)

	// Assert user ssh secret exists
	data, err := s.Client.GetSecret(context.Background(), secretSSHName)
	s.Require().NoError(err)
	s.Require().Equal("public-key", string(data[k8s.KdlUserPublicSSHKey]))
	s.Require().Equal("private-key", string(data[k8s.KdlUserPrivateSSHKey]))
}
