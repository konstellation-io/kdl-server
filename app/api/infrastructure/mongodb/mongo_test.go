//go:build integration

package mongodb_test

import (
	"context"
	"fmt"
	"testing"
	"time"

	"bou.ke/monkey"
	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/mongodb"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const (
	dbName               = "kdl"
	capabilitiesCollName = "capabilities"
	projectCollName      = "projects"
)

var (
	testTimeExample = time.Now().Add(-time.Hour).Truncate(time.Millisecond).UTC()
)

var capabilitiesExamples = map[string]entity.Capabilities{
	"capability1": {
		ID:            "1",
		Name:          "capability1",
		Default:       false,
		NodeSelectors: map[string]string{"key1": "value1"},
		Tolerations:   []map[string]interface{}{{"key1": "value1"}},
		Affinities:    map[string]interface{}{"key1": "value1"},
	},
	"capability2": {
		ID:            "2",
		Name:          "capability2",
		NodeSelectors: map[string]string{"key2": "value2"},
		Tolerations:   []map[string]interface{}{{"key2": "value2"}},
		Affinities:    map[string]interface{}{"key2": "value2"},
	},
}

var projectExamples = map[string]entity.Project{
	"project1": {
		ID:                 "1",
		Name:               "project1",
		Description:        "description1",
		CreationDate:       testTimeExample,
		LastActivationDate: "01-01-1998",
		Favorite:           false,
		Archived:           false,
		Error:              nil,
		Repository: entity.Repository{
			Type:            entity.RepositoryTypeExternal,
			ExternalRepoURL: "http://repo1",
			RepoName:        "repo1",
			Error:           nil,
			AuthMethod:      entity.RepositoryAuthToken,
		},
		Members: []entity.Member{
			{
				UserID:      primitive.NewObjectID().Hex(),
				AccessLevel: entity.AccessLevelAdmin,
				AddedDate:   testTimeExample,
			},
		},
	},
	"project2": {
		ID:                 "2",
		Name:               "project2",
		Description:        "description2",
		CreationDate:       testTimeExample,
		LastActivationDate: "01-01-1998",
		Favorite:           false,
		Archived:           false,
		Error:              nil,
		Repository: entity.Repository{
			Type:            entity.RepositoryTypeExternal,
			ExternalRepoURL: "http://repo2",
			RepoName:        "repo2",
			Error:           nil,
			AuthMethod:      entity.RepositoryAuthToken,
		},
		Members: []entity.Member{
			{
				UserID:      primitive.NewObjectID().Hex(),
				AccessLevel: entity.AccessLevelAdmin,
				AddedDate:   testTimeExample,
			},
		},
	},
}

type TestSuite struct {
	suite.Suite
	mongoDBContainer testcontainers.Container
	mongoClient      *mongo.Client
	capabilitiesRepo *mongodb.CapabilitiesRepo
	projectRepo      *mongodb.ProjectRepo
}

func TestProcessRepositoryTestSuite(t *testing.T) {
	suite.Run(t, new(TestSuite))
}

func (s *TestSuite) SetupSuite() {
	ctx := context.Background()
	logger := logging.NewLogger("debug")

	rootUsername := "root"
	rootPassword := "root"

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
	uri := fmt.Sprintf("mongodb://%v:%v@%v:%v/", rootUsername, rootPassword, host, port) //NOSONAR not used in secure contexts
	mongoClient, err := mongo.Connect(context.Background(), options.Client().ApplyURI(uri))
	s.Require().NoError(err)

	s.mongoDBContainer = mongoDBContainer
	s.mongoClient = mongoClient
	s.capabilitiesRepo = mongodb.NewCapabilitiesRepo(logger, mongoClient, dbName)
	s.projectRepo = mongodb.NewProjectRepo(logger, mongoClient, dbName)

	// viper.Set(config.MongoDBKaiDatabaseKey, _kaiProduct)

	monkey.Patch(time.Now, func() time.Time {
		return time.Date(2021, 1, 1, 0, 0, 0, 0, time.UTC)
	})

	// populate database with some data
	s.SetupCapabilities(mongoClient)
	s.SetupProjects(mongoClient)
}

// SetupCapabilities populates the database with some data regarding capabilites
func (s *TestSuite) SetupCapabilities(mongoClient *mongo.Client) {
	capabilitiesCollection := mongoClient.Database(dbName).Collection(capabilitiesCollName)

	for _, c := range capabilitiesExamples {
		_, err := capabilitiesCollection.InsertOne(context.Background(), c)
		s.Require().NoError(err)
	}
}

// SetupProjects populates the database with some data regarding projects
func (s *TestSuite) SetupProjects(mongoClient *mongo.Client) {
	for _, p := range projectExamples {
		_, err := s.projectRepo.Create(context.Background(), p)
		s.Require().NoError(err)
	}
}

func (s *TestSuite) TearDownSuite() {
	monkey.UnpatchAll()
	s.Require().NoError(s.mongoDBContainer.Terminate(context.Background()))
}

func (s *TestSuite) TearDownTest() {
	// filter := bson.D{}

	// _, err := s.mongoClient.Database(_productID).
	// 	Collection(registeredProcessCollectionName).
	// 	DeleteMany(context.Background(), filter)
	// s.Require().NoError(err)
}

func (s *TestSuite) TestGetCapabilities_OK() {
	ctx := context.Background()

	expectedCapabilitie := capabilitiesExamples["capability1"]

	actualCapabilitie, err := s.capabilitiesRepo.Get(ctx, expectedCapabilitie.ID)
	s.Require().NoError(err)

	s.Equal(expectedCapabilitie, actualCapabilitie)
}

func (s *TestSuite) TestGetCapabilities_NoID() {
	ctx := context.Background()

	_, err := s.capabilitiesRepo.Get(ctx, "")
	s.Require().Error(err)
	s.Equal(entity.ErrCapabilitiesNotFound, err)
}

func (s *TestSuite) TestGetCapabilities_NotFound() {
	ctx := context.Background()

	_, err := s.capabilitiesRepo.Get(ctx, "notfound")
	s.Require().Error(err)
	s.Equal(entity.ErrCapabilitiesNotFound, err)
}

func (s *TestSuite) TestFindAllCapabilities_OK() {
	ctx := context.Background()

	expectedCapabilities := []entity.Capabilities{
		capabilitiesExamples["capability1"],
		capabilitiesExamples["capability2"],
	}

	actualCapabilities, err := s.capabilitiesRepo.FindAll(ctx)
	s.Require().NoError(err)

	s.Equal(expectedCapabilities, actualCapabilities)
}

func (s *TestSuite) TestCreateProject_OK() {
	ctx := context.Background()

	project := projectExamples["project1"]

	// remove project1 from the database
	projectsCollection := s.mongoClient.Database(dbName).Collection(projectCollName)
	_, err := projectsCollection.DeleteOne(ctx, bson.M{"_id": project.ID})

	id, err := s.projectRepo.Create(ctx, project)
	s.Require().NoError(err)

	s.NotEmpty(id)
}

func (s *TestSuite) TestGetProject_OK() {
	ctx := context.Background()

	expectedProject := projectExamples["project1"]

	actualProject, err := s.projectRepo.Get(ctx, expectedProject.ID)
	s.Require().NoError(err)

	s.Equal(expectedProject, actualProject)
}
