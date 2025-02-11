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
	"github.com/minio/madmin-go/v2"
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

const (
	testProjectName     string = "trinity"
	testProjectName2    string = "tarpcheck"
	testProjectPassword string = "-i2YaLei0ohwayaes_hz" // gitleaks:allow
	testEmail           string = "foo@example.com"
	testPassword        string = "Aeb_xum0zeng6p-o" // gitleaks:allow
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

	for _, group := range []string{testProjectName, testProjectName2} {
		_ = s.adminClient.UpdateGroupMembers(ctx, madmin.GroupAddRemove{
			Group:    group,
			IsRemove: true,
			Members:  []string{"foo@example.com"},
		})

		// a call to this method on an empty group removes it
		_ = s.adminClient.UpdateGroupMembers(ctx, madmin.GroupAddRemove{
			Group:    group,
			IsRemove: true,
			Members:  []string{},
		})
	}

	users, err := s.adminClient.ListUsers(ctx)
	s.Require().NoError(err)

	for username := range users {
		err = s.adminClient.RemoveUser(ctx, username)
		s.Require().NoError(err)

		_ = s.adminClient.RemoveCannedPolicy(ctx, username)
	}

	err = s.adminClient.RemoveCannedPolicy(ctx, testProjectName)
	s.Require().NoError(err)

	err = s.adminClient.RemoveCannedPolicy(ctx, testProjectName2)
	s.Require().NoError(err)

	err = s.client.RemoveObject(ctx, testProjectName, "hello.txt", minio.RemoveObjectOptions{})
	s.Require().NoError(err)
	err = s.client.RemoveBucket(ctx, testProjectName)
	s.Require().NoError(err)
}

func (s *TestSuite) SetupTest() {
	ctx := context.Background()

	err := s.client.MakeBucket(ctx, testProjectName, minio.MakeBucketOptions{})
	s.Require().NoError(err)

	_, err = s.client.PutObject(ctx, testProjectName, "hello.txt",
		bytes.NewReader([]byte("hello world")), -1, minio.PutObjectOptions{})
	s.Require().NoError(err)
}

func (s *TestSuite) TestCreateUser() {
	ctx := context.Background()

	accessKey, err := s.service.CreateUser(ctx, testEmail, password)
	s.Require().NoError(err)
	s.Require().Equal(testEmail, accessKey)

	users, err := s.adminClient.ListUsers(ctx)
	s.Require().NoError(err)
	s.Len(users, 1)
	_, ok := users[accessKey]
	s.Require().True(ok)
}

func (s *TestSuite) TestDeleteUser() {
	ctx := context.Background()

	accessKey, err := s.service.CreateUser(ctx, testEmail, password)
	s.Require().NoError(err)
	s.Require().Equal(testEmail, accessKey)

	err = s.service.DeleteUser(ctx, testEmail)
	s.Require().NoError(err)

	users, err := s.adminClient.ListUsers(ctx)
	s.Require().NoError(err)
	s.Empty(users)
}

func (s *TestSuite) TestCreateProjectUser() {
	ctx := context.Background()

	err := s.service.CreateProjectPolicy(ctx, testProjectName)
	s.Require().NoError(err)

	accessKey, err := s.service.CreateProjectUser(ctx, testProjectName, testProjectPassword)
	s.Require().NoError(err)
	s.Require().Equal(testProjectName, accessKey)

	users, err := s.adminClient.ListUsers(ctx)
	s.Require().NoError(err)
	s.Len(users, 1)
	_, ok := users[accessKey]
	s.Require().True(ok)
}

func (s *TestSuite) TestDeleteProjectUser() {
	ctx := context.Background()

	err := s.service.CreateProjectPolicy(ctx, testProjectName)
	s.Require().NoError(err)

	accessKey, err := s.service.CreateProjectUser(ctx, testProjectName, testProjectPassword)
	s.Require().NoError(err)
	s.Require().Equal(testProjectName, accessKey)

	err = s.service.DeleteProjectUser(ctx, testProjectName)
	s.Require().NoError(err)

	users, err := s.adminClient.ListUsers(ctx)
	s.Require().NoError(err)
	s.Empty(users)
}

func (s *TestSuite) TestDeleteUserIdempotence() {
	ctx := context.Background()

	err := s.service.DeleteUser(ctx, "nonexistent@example.com")
	s.Require().NoError(err)
}

func (s *TestSuite) TestAssignProject() {
	ctx := context.Background()

	err := s.service.CreateProjectPolicy(ctx, testProjectName)
	s.Require().NoError(err)

	accessKey, err := s.service.CreateUser(ctx, testEmail, testPassword)
	s.Require().NoError(err)
	s.Require().Equal(testEmail, accessKey)

	err = s.service.JoinProject(ctx, testEmail, testProjectName)
	s.Require().NoError(err)

	// User login
	endpoint, err := s.container.ConnectionString(ctx)
	s.Require().NoError(err)

	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(testEmail, testPassword, ""),
		Secure: false,
	})
	s.Require().NoError(err)

	// List buckets
	buckets, err := client.ListBuckets(ctx)
	s.Require().NoError(err)

	s.Len(buckets, 1)
	s.Equal(testProjectName, buckets[0].Name)

	// List objects
	objectCh := client.ListObjects(ctx, testProjectName, minio.ListObjectsOptions{})
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

	err := s.service.CreateProjectPolicy(ctx, testProjectName2)
	s.Require().NoError(err)

	accessKey, err := s.service.CreateUser(ctx, testEmail, testPassword)
	s.Require().NoError(err)
	s.Require().Equal(testEmail, accessKey)

	err = s.service.JoinProject(ctx, testEmail, testProjectName2)
	s.Require().NoError(err)

	// User login
	endpoint, err := s.container.ConnectionString(ctx)
	s.Require().NoError(err)

	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(testEmail, testPassword, ""),
		Secure: false,
	})
	s.Require().NoError(err)

	// List objects shall fail
	objectCh := client.ListObjects(ctx, testProjectName, minio.ListObjectsOptions{})
	object := <-objectCh
	s.Require().Error(object.Err)
}

func (s *TestSuite) TestDeletePolicy() {
	ctx := context.Background()

	err := s.service.CreateProjectPolicy(ctx, testProjectName)
	s.Require().NoError(err)

	err = s.service.DeleteProjectPolicy(ctx, testProjectName)
	s.Require().NoError(err)

	policies, err := s.adminClient.ListCannedPolicies(ctx)
	s.Require().NoError(err)

	for policy := range policies {
		s.Require().NotEqual(testProjectName, policy)
	}
}

func (s *TestSuite) TestDeletePolicyIdempotence() {
	ctx := context.Background()

	err := s.service.DeleteProjectPolicy(ctx, "nonexistent")
	s.Require().NoError(err)
}
