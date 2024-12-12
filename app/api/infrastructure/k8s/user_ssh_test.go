//go:build integration

package k8s_test

import (
	"context"
	"testing"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/k8s"

	"github.com/stretchr/testify/suite"
)

const (
	userSSHCreateName = "user-ssh-create"
	userSSHGetName    = "user-ssh-get"
	userSSHUpdateName = "user-ssh-update"
)

type userSSHTestSuite struct {
	k8s.TestSuite
}

func TestUserSSHSuite(t *testing.T) {
	suite.Run(t, new(userSSHTestSuite))
}

func (s *userSSHTestSuite) TestCreateUserSSHKeySecret() {
	user := entity.User{
		Username: userSSHCreateName,
	}
	err := s.Client.CreateUserSSHKeySecret(context.Background(), user, "public-key", "private-key")
	s.Require().NoError(err)
}

func (s *userSSHTestSuite) TestUpdateUserSSHKeySecret() {
	user := entity.User{
		Username: userSSHUpdateName,
	}
	err := s.Client.CreateUserSSHKeySecret(context.Background(), user, "public-key", "private-key")
	s.Require().NoError(err)

	// Assert user ssh secret exists
	data, err := s.Client.GetSecret(context.Background(), "user-ssh-create-ssh-keys")
	s.Require().NoError(err)
	s.Require().Equal("public-key", string(data[k8s.KdlUserPublicSSHKey]))
	s.Require().Equal("private-key", string(data[k8s.KdlUserPrivateSSHKey]))

	// Update user ssh key secret
	err = s.Client.UpdateUserSSHKeySecret(context.Background(), user, "new-public-key", "new-private-key")
	s.Require().NoError(err)

	// Assert user ssh secret is updated
	data, err = s.Client.GetSecret(context.Background(), "user-ssh-update-ssh-keys")
	s.Require().NoError(err)
	s.Require().Equal("new-public-key", string(data[k8s.KdlUserPublicSSHKey]))
	s.Require().Equal("new-private-key", string(data[k8s.KdlUserPrivateSSHKey]))
}

func (s *userSSHTestSuite) TestGetUserSSHKeySecret() {
	user := entity.User{
		Username: userSSHGetName,
	}
	err := s.Client.CreateUserSSHKeySecret(context.Background(), user, "public-key", "private-key")
	s.Require().NoError(err)

	// Assert user ssh secret exists
	data, err := s.Client.GetSecret(context.Background(), "user-ssh-get-ssh-keys")
	s.Require().NoError(err)
	s.Require().Equal("public-key", string(data[k8s.KdlUserPublicSSHKey]))
	s.Require().Equal("private-key", string(data[k8s.KdlUserPrivateSSHKey]))
}
