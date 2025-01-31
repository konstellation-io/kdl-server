//go:build integration

package minio_test

import (
	"context"
	"fmt"
	"testing"
	"time"

	"bou.ke/monkey"
	"github.com/go-logr/logr"
	"github.com/go-logr/zapr"
	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.uber.org/zap"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/minioadminservice"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/mongodb"
	"github.com/konstellation-io/kdl-server/app/api/pkg/kdlutil"
	"github.com/konstellation-io/kdl-server/app/api/pkg/mongodbutils"
	"github.com/konstellation-io/kdl-server/app/api/scripts/minio"
)

const (
	dbName       = "kdl"
	rootUsername = "root"
	rootPassword = "root"
)

var (
	userID          = primitive.NewObjectID().Hex()
	testTimeExample = time.Now().Add(-time.Hour).Truncate(time.Millisecond).UTC()
	userEntity      = entity.User{
		ID:           userID,
		Email:        "email1",
		Username:     "user1",
		Sub:          "d5d70477-5192-4182-b80e-5d34550eb4fe",
		LastActivity: testTimeExample,
	}
	projectEntity = entity.Project{
		ID:          primitive.NewObjectID().Hex(),
		Name:        "project1",
		Description: "description1",
		Members: []entity.Member{
			{
				UserID: userID,
			},
		},
	}
)

type TestSuite struct {
	suite.Suite
	logger            logr.Logger
	mongoDBContainer  testcontainers.Container
	mongoClient       *mongodbutils.MongoDB
	projectRepo       *mongodb.ProjectRepo
	userRepo          *mongodb.UserRepo
	randomGenerator   *kdlutil.RandomGeneratorImplementation
	minioAdminService *minioadminservice.MockMinioAdminInterface
}

func TestSyncMinioTestSuite(t *testing.T) {
	suite.Run(t, new(TestSuite))
}

func (s *TestSuite) SetupSuite() {
	ctx := context.Background()

	zapLog, err := zap.NewDevelopment()
	s.Require().NoError(err)

	s.logger = zapr.NewLogger(zapLog)

	req := testcontainers.ContainerRequest{
		Image:        "mongo:8.0",
		ExposedPorts: []string{"27017/tcp", "27018/tcp"},
		Env: map[string]string{
			"MONGO_INITDB_ROOT_USERNAME": rootUsername,
			"MONGO_INITDB_ROOT_PASSWORD": rootPassword,
		},
		WaitingFor: wait.ForLog("MongoDB starting"),
	}

	mongoDBContainer, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: req,
		Started:          true,
	})
	s.Require().NoError(err)

	host, err := mongoDBContainer.Host(context.Background())
	s.Require().NoError(err)
	p, err := mongoDBContainer.MappedPort(context.Background(), "27017/tcp")
	s.Require().NoError(err)

	port := p.Int()
	uri := fmt.Sprintf("mongodb://%v:%v@%v:%v/", rootUsername, rootPassword, host, port) // NOSONAR not used in secure contexts
	mongoClient, err := mongodbutils.NewMongoDB(s.logger, uri)
	s.Require().NoError(err)

	s.mongoDBContainer = mongoDBContainer
	s.mongoClient = mongoClient
	s.projectRepo = mongodb.NewProjectRepo(s.logger, mongoClient, dbName)
	s.userRepo = mongodb.NewUserRepo(s.logger, mongoClient, dbName)

	// set random generator
	s.randomGenerator = kdlutil.NewRandomGenerator()

	ctrl := gomock.NewController(s.T())
	defer ctrl.Finish()

	s.minioAdminService = minioadminservice.NewMockMinioAdminInterface(ctrl)

	monkey.Patch(time.Now, func() time.Time {
		return time.Date(2021, 1, 1, 0, 0, 0, 0, time.UTC)
	})
}

func (s *TestSuite) TearDownSuite() {
	monkey.UnpatchAll()
	s.Require().NoError(s.mongoDBContainer.Terminate(context.Background()))
}

func (s *TestSuite) TearDownTest() {
	err := s.mongoClient.DropDatabase(dbName)
	s.Require().NoError(err)
}

func (s *TestSuite) TestSyncUsers() {
	// assert that MinIO Access and Secret keys are empty
	s.Require().Empty(userEntity.MinioAccessKey.AccessKey)
	s.Require().Empty(userEntity.MinioAccessKey.SecretKey)

	ctx := context.Background()

	_, err := s.userRepo.Create(ctx, userEntity)
	s.Require().NoError(err)

	s.minioAdminService.EXPECT().CreateUser(ctx, gomock.Any(), gomock.Any()).Return(gomock.Any().String(), nil)

	err = minio.SyncUsers(s.logger, s.userRepo, s.minioAdminService, s.randomGenerator)
	s.Require().NoError(err)

	// Assert minIO Access and Secret keys were created for user
	u, err := s.userRepo.Get(ctx, userEntity.ID)
	s.Require().NoError(err)
	s.Require().NotEmpty(u.MinioAccessKey.AccessKey)
	s.Require().NotEmpty(u.MinioAccessKey.SecretKey)
}

func (s *TestSuite) TestSyncUsers_NoUsers() {
	err := minio.SyncUsers(s.logger, s.userRepo, s.minioAdminService, s.randomGenerator)
	s.Require().NoError(err)
}

func (s *TestSuite) TestSyncProjects() {
	// assert that MinIO Access and Secret keys are empty
	s.Require().Empty(projectEntity.MinioAccessKey.AccessKey)
	s.Require().Empty(projectEntity.MinioAccessKey.SecretKey)

	ctx := context.Background()

	_, err := s.projectRepo.Create(ctx, projectEntity)
	s.Require().NoError(err)

	_, err = s.userRepo.Create(ctx, userEntity)
	s.Require().NoError(err)

	s.minioAdminService.EXPECT().CreateProjectPolicy(ctx, projectEntity.ID).Return(nil)
	s.minioAdminService.EXPECT().CreateProjectUser(ctx, projectEntity.ID, gomock.Any()).Return(gomock.Any().String(), nil)
	s.minioAdminService.EXPECT().JoinProject(ctx, gomock.Any(), projectEntity.ID).Return(nil)

	err = minio.SyncProjects(s.logger, s.projectRepo, s.userRepo, s.minioAdminService, s.randomGenerator)
	s.Require().NoError(err)

	// Assert minIO Access and Secret keys were created for project
	p, err := s.projectRepo.Get(ctx, projectEntity.ID)
	s.Require().NoError(err)
	s.Require().NotEmpty(p.MinioAccessKey.AccessKey)
	s.Require().NotEmpty(p.MinioAccessKey.SecretKey)
}

func (s *TestSuite) TestSyncProjects_NoProjects() {
	err := minio.SyncProjects(s.logger, s.projectRepo, s.userRepo, s.minioAdminService, s.randomGenerator)
	s.Require().NoError(err)
}
