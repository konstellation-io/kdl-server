//go:build integration

package minioadminservice_test

import (
	"bytes"
	"context"
	"testing"

	"bou.ke/monkey"
	"go.uber.org/zap"

	"github.com/go-logr/zapr"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/minioadminservice"
	"github.com/minio/madmin-go"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go"
	tcminio "github.com/testcontainers/testcontainers-go/modules/minio"
)

const (
	username = "admin"
	password = "admin123"
)

type TestSuite struct {
	suite.Suite
	container   *tcminio.MinioContainer
	adminClient *madmin.AdminClient
	client      *minio.Client
	service     *minioadminservice.MinioAdminService
}

func TestMinioAdminServiceTestSuite(t *testing.T) {
	suite.Run(t, new(TestSuite))
}

func (s *TestSuite) SetupSuite() {
	ctx := context.Background()

	zapLog, err := zap.NewDevelopment()
	s.Require().NoError(err)

	logger := zapr.NewLogger(zapLog)

	s.container, err = tcminio.Run(ctx, "minio/minio:RELEASE.2024-01-16T16-07-38Z",
		tcminio.WithUsername(username), tcminio.WithPassword(password))
	s.Require().NoError(err)

	endpoint, err := s.container.ConnectionString(ctx)
	s.Require().NoError(err)

	s.service, err = minioadminservice.NewMinioAdminService(logger, endpoint, username, password)
	s.Require().NoError(err)

	s.adminClient, err = madmin.New(endpoint, username, password, false)
	s.Require().NoError(err)

	s.client, err = minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(username, password, ""),
		Secure: false,
	})
	s.Require().NoError(err)
}

func (s *TestSuite) TearDownSuite() {
	monkey.UnpatchAll()
	s.Require().NoError(testcontainers.TerminateContainer(s.container))
}

func (s *TestSuite) TearDownTest() {
	ctx := context.Background()

	users, err := s.adminClient.ListUsers(ctx)
	s.Require().NoError(err)

	for username := range users {
		err = s.adminClient.RemoveUser(ctx, username)
		s.Require().NoError(err)
	}

	policies, err := s.adminClient.ListCannedPolicies(ctx)
	s.Require().NoError(err)

	for policyname := range policies {
		// some policies pre-defined can't be removed (ignore errors)
		_ = s.adminClient.RemoveCannedPolicy(ctx, policyname)
	}

	err = s.client.RemoveObject(ctx, "project1", "hello.txt", minio.RemoveObjectOptions{})
	s.Require().NoError(err)
	err = s.client.RemoveBucket(ctx, "project1")
	s.Require().NoError(err)
}

func (s *TestSuite) SetupTest() {
	ctx := context.Background()

	err := s.client.MakeBucket(ctx, "project1", minio.MakeBucketOptions{})
	s.Require().NoError(err)

	_, err = s.client.PutObject(ctx, "project1", "hello.txt",
		bytes.NewReader([]byte("hello world")), -1, minio.PutObjectOptions{})
	s.Require().NoError(err)
}

func (s *TestSuite) TestCreateUser() {
	ctx := context.Background()

	const (
		// # gitleaks ignore
		username string = "171e78c8-c35e-429b-b6e9-21cf6eadae0b"
		password string = "-i2YaLei0ohwayaes_hz" // gitleaks:allow
	)

	err := s.service.CreateUser(ctx, username, password)
	s.Require().NoError(err)

	users, err := s.adminClient.ListUsers(ctx)
	s.Require().NoError(err)
	s.Len(users, 1)
	_, ok := users[username]
	s.Require().True(ok)
}

func (s *TestSuite) TestDeleteUser() {
	ctx := context.Background()

	err := s.service.CreateUser(ctx, "foo", "foo12345678")
	s.Require().NoError(err)

	err = s.service.DeleteUser(ctx, "foo")
	s.Require().NoError(err)

	users, err := s.adminClient.ListUsers(ctx)
	s.Require().NoError(err)
	s.Len(users, 0)
}
func (s *TestSuite) TestDeleteUserIdempotence() {
	ctx := context.Background()

	err := s.service.DeleteUser(ctx, "nonexistent")
	s.Require().NoError(err)

}

func (s *TestSuite) TestAssignProject() {
	ctx := context.Background()

	err := s.service.CreateUser(ctx, "foo", "foo12345678")
	s.Require().NoError(err)

	err = s.service.UpdatePolicy(ctx, "policy1", []string{"project1"})
	s.Require().NoError(err)

	err = s.service.AssignPolicy(ctx, "foo", "policy1")
	s.Require().NoError(err)

	// User login
	endpoint, err := s.container.ConnectionString(ctx)
	s.Require().NoError(err)

	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4("foo", "foo12345678", ""),
		Secure: false,
	})
	s.Require().NoError(err)

	// List buckets
	buckets, err := client.ListBuckets(ctx)
	s.Require().NoError(err)

	s.Len(buckets, 1)
	s.Equal("project1", buckets[0].Name)

	// List objects
	objectCh := client.ListObjects(ctx, "project1", minio.ListObjectsOptions{})
	objects := make([]minio.ObjectInfo, 0)

	for object := range objectCh {
		s.Require().NoError(object.Err)
		objects = append(objects, object)
	}

	s.Require().NoError(err)
	s.Len(objects, 1)
	s.Equal("hello.txt", objects[0].Key)
}

func (s *TestSuite) TestBucketNotAllowed() {
	ctx := context.Background()

	err := s.service.CreateUser(ctx, "foo", "foo12345678")
	s.Require().NoError(err)

	err = s.service.UpdatePolicy(ctx, "policy1", []string{"project2"})
	s.Require().NoError(err)

	err = s.service.AssignPolicy(ctx, "foo", "policy1")
	s.Require().NoError(err)

	// User login
	endpoint, err := s.container.ConnectionString(ctx)
	s.Require().NoError(err)

	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4("foo", "foo12345678", ""),
		Secure: false,
	})
	s.Require().NoError(err)

	// List objects shall fail
	objectCh := client.ListObjects(ctx, "project1", minio.ListObjectsOptions{})
	object := <-objectCh
	s.Require().Error(object.Err)
}

func (s *TestSuite) TestDeletePolicy() {
	ctx := context.Background()

	err := s.service.UpdatePolicy(ctx, "policy1", []string{"project1"})
	s.Require().NoError(err)

	err = s.service.DeletePolicy(ctx, "policy1")
	s.Require().NoError(err)

	policies, err := s.adminClient.ListCannedPolicies(ctx)
	s.Require().NoError(err)
	for policy := range policies {
		s.Require().NotEqual(policy, "policy1")
	}

}

func (s *TestSuite) TestDeletePolicyIdempotence() {
	ctx := context.Background()

	err := s.service.DeletePolicy(ctx, "nonexistent")
	s.Require().NoError(err)

}
