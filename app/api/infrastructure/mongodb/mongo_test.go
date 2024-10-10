//go:build integration

package mongodb_test

import (
	"context"
	"fmt"
	"testing"
	"time"

	"bou.ke/monkey"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/mongodb"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
)

const (
	dbName               = "kdl"
	capabilitiesCollName = "capabilities"
	projectCollName      = "projects"
	runtimesCollName     = "runtimes"
	userActivityCollName = "userActivity"
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

var runtimeExamples = map[string]entity.Runtime{
	"runtime1": {
		ID:          primitive.NewObjectID().Hex(),
		Name:        "runtime1",
		Desc:        "description1",
		Labels:      []string{"label1", "label2"},
		DockerImage: "dockerImage1",
		DockerTag:   "dockerTag1",
	},
	"runtime2": {
		ID:          primitive.NewObjectID().Hex(),
		Name:        "runtime2",
		Desc:        "description2",
		Labels:      []string{"label3", "label4"},
		DockerImage: "dockerImage2",
		DockerTag:   "dockerTag2",
	},
}

type TestSuite struct {
	suite.Suite
	mongoDBContainer testcontainers.Container
	mongoClient      *mongo.Client
	capabilitiesRepo *mongodb.CapabilitiesRepo
	projectRepo      *mongodb.ProjectRepo
	runtimeRepo      *mongodb.RuntimeRepo
	userActivityRepo *mongodb.UserActivityRepo
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
	s.runtimeRepo = mongodb.NewRuntimeRepo(logger, mongoClient, dbName)
	s.userActivityRepo = mongodb.NewUserActivityRepo(logger, mongoClient, dbName)

	// viper.Set(config.MongoDBKaiDatabaseKey, _kaiProduct)

	monkey.Patch(time.Now, func() time.Time {
		return time.Date(2021, 1, 1, 0, 0, 0, 0, time.UTC)
	})

	// populate database with some data
	s.SetupCapabilities(mongoClient)
	s.SetupProjects(mongoClient)
	s.SetupRuntimes(mongoClient)
}

// SetupCapabilities populates the database with some data regarding capabilites
func (s *TestSuite) SetupCapabilities(mongoClient *mongo.Client) {
	for _, c := range capabilitiesExamples {
		_, err := s.capabilitiesRepo.Create(context.Background(), c)
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

func (s *TestSuite) SetupRuntimes(mongoClient *mongo.Client) {
	for _, r := range runtimeExamples {
		_, err := s.runtimeRepo.Create(context.Background(), r)
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

	expectedCapability := capabilitiesExamples["capability1"]

	actualCapability, err := s.capabilitiesRepo.Get(ctx, expectedCapability.ID)
	s.Require().NoError(err)

	s.Equal(expectedCapability, actualCapability)
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

	actualCapabilities, err := s.capabilitiesRepo.FindAll(ctx)
	s.Require().NoError(err)

	s.Len(actualCapabilities, 2)
}

func (s *TestSuite) TestCreateProject_OK() {
	ctx := context.Background()

	project := projectExamples["project1"]

	// remove project1 from the database as it was saved previously
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

func (s *TestSuite) TestGetProject_NotFound() {
	ctx := context.Background()

	_, err := s.projectRepo.Get(ctx, "notfound")
	s.Require().Error(err)
	s.Equal(entity.ErrProjectNotFound, err)
}

func (s *TestSuite) TestFindAllProjects_OK() {
	ctx := context.Background()

	actualProjects, err := s.projectRepo.FindAll(ctx)
	s.Require().NoError(err)

	s.Len(actualProjects, 2)
}

func (s *TestSuite) TestAddMembers_OK() {
	ctx := context.Background()

	project := projectExamples["project1"]
	members := []entity.Member{
		{
			UserID:      primitive.NewObjectID().Hex(),
			AccessLevel: entity.AccessLevelManager,
			AddedDate:   testTimeExample,
		},
	}

	err := s.projectRepo.AddMembers(ctx, project.ID, members)
	s.Require().NoError(err)

	actualProject, err := s.projectRepo.Get(ctx, project.ID)
	s.Require().NoError(err)

	s.Equal(len(project.Members)+len(members), len(actualProject.Members))
}

func (s *TestSuite) TestRemoveMembers_OK() {
	ctx := context.Background()

	project := projectExamples["project1"]
	members := []entity.Member{
		{
			UserID:      primitive.NewObjectID().Hex(),
			AccessLevel: entity.AccessLevelManager,
			AddedDate:   testTimeExample,
		},
	}
	users := []entity.User{
		{
			ID:       members[0].UserID,
			Username: "user1",
		},
	}

	err := s.projectRepo.AddMembers(ctx, project.ID, members)
	s.Require().NoError(err)

	actualProject, err := s.projectRepo.Get(ctx, project.ID)
	s.Require().NoError(err)

	s.Equal(len(project.Members)+len(members), len(actualProject.Members))

	err = s.projectRepo.RemoveMembers(ctx, project.ID, users)
	s.Require().NoError(err)

	actualProject, err = s.projectRepo.Get(ctx, project.ID)
	s.Require().NoError(err)

	s.Equal(len(project.Members), len(actualProject.Members))
}

func (s *TestSuite) TestUpdateMembersAccessLevel_OK() {
	ctx := context.Background()

	project := projectExamples["project1"]

	actualProject, err := s.projectRepo.Get(ctx, project.ID)
	s.Require().NoError(err)

	s.Require().True(len(actualProject.Members) >= 1)
	aGivenMember := actualProject.Members[len(actualProject.Members)-1]

	usersToModify := []entity.User{
		{
			ID: aGivenMember.UserID,
		},
	}

	newAccessLevel := entity.AccessLevelViewer

	s.NotEqual(newAccessLevel, aGivenMember.AccessLevel)

	err = s.projectRepo.UpdateMembersAccessLevel(ctx, project.ID, usersToModify, newAccessLevel)
	s.Require().NoError(err)

	actualProject, err = s.projectRepo.Get(ctx, project.ID)
	s.Require().NoError(err)

	for _, m := range actualProject.Members {
		if m.UserID == usersToModify[0].ID {
			s.Equal(newAccessLevel, m.AccessLevel)
		}
	}
}

func (s *TestSuite) TestUpdateName_OK() {
	ctx := context.Background()

	project := projectExamples["project1"]
	newName := "newName"

	err := s.projectRepo.UpdateName(ctx, project.ID, newName)
	s.Require().NoError(err)

	actualProject, err := s.projectRepo.Get(ctx, project.ID)
	s.Require().NoError(err)

	s.Equal(newName, actualProject.Name)
}

func (s *TestSuite) TestUpdateDescription_OK() {
	ctx := context.Background()

	project := projectExamples["project1"]
	newDescription := "newDescription"

	err := s.projectRepo.UpdateDescription(ctx, project.ID, newDescription)
	s.Require().NoError(err)

	actualProject, err := s.projectRepo.Get(ctx, project.ID)
	s.Require().NoError(err)

	s.Equal(newDescription, actualProject.Description)
}

func (s *TestSuite) TestUpdateArchived_OK() {
	ctx := context.Background()

	project := projectExamples["project1"]
	newArchived := true

	err := s.projectRepo.UpdateArchived(ctx, project.ID, newArchived)
	s.Require().NoError(err)

	actualProject, err := s.projectRepo.Get(ctx, project.ID)
	s.Require().NoError(err)

	s.Equal(newArchived, actualProject.Archived)
}

func (s *TestSuite) TestDeleteOne_OK() {
	ctx := context.Background()

	testProject := entity.Project{
		ID:          "3",
		Name:        "testProject",
		Description: "description3",
	}

	_, err := s.projectRepo.Create(ctx, testProject)

	_, err = s.projectRepo.Get(ctx, testProject.ID)
	s.Require().NoError(err)

	err = s.projectRepo.DeleteOne(ctx, testProject.ID)
	s.Require().NoError(err)

	_, err = s.projectRepo.Get(ctx, testProject.ID)
	s.Require().Error(err)
	s.Equal(entity.ErrProjectNotFound, err)
}

func (s *TestSuite) TestDeleteOne_NoPreviousProject() {
	ctx := context.Background()

	err := s.projectRepo.DeleteOne(ctx, "notfound")
	s.Require().Error(err)
}

func (s *TestSuite) TestGetRuntime_OK() {
	ctx := context.Background()

	expectedRuntime := runtimeExamples["runtime1"]

	actualRuntime, err := s.runtimeRepo.Get(ctx, expectedRuntime.ID)
	s.Require().NoError(err)

	s.Equal(expectedRuntime, actualRuntime)
}

func (s *TestSuite) TestGetRuntime_NotValidHex() {
	ctx := context.Background()

	_, err := s.runtimeRepo.Get(ctx, "notvalid")
	s.Require().Error(err)
	s.Equal(primitive.ErrInvalidHex, err)
}

func (s *TestSuite) TestGetRuntime_NotFound() {
	ctx := context.Background()

	_, err := s.runtimeRepo.Get(ctx, primitive.NewObjectID().Hex())
	s.Require().Error(err)
	s.Equal(entity.ErrRuntimeNotFound, err)
}

func (s *TestSuite) TestFindAllRuntimes_OK() {
	ctx := context.Background()

	actualRuntimes, err := s.runtimeRepo.FindAll(ctx)
	s.Require().NoError(err)

	s.Len(actualRuntimes, 2)
}

func (s *TestSuite) TestCreateUserActivity_OK() {
	ctx := context.Background()

	userActivityExample := entity.UserActivity{
		Date:   testTimeExample,
		UserID: primitive.NewObjectID().Hex(),
		Type:   entity.UserActivityTypeDeleteProject,
		Vars: []entity.UserActivityVar{
			{
				Key:   "PROJECT_ID",
				Value: "projectID",
			},
		},
	}

	err := s.userActivityRepo.Create(ctx, userActivityExample)
	s.Require().NoError(err)
}
