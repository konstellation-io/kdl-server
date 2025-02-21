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
	"go.uber.org/zap"

	"github.com/go-logr/zapr"
	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/mongodb"
	"github.com/konstellation-io/kdl-server/app/api/pkg/mongodbutils"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
)

const (
	dbName       = "kdl"
	userCollName = "users"
	rootUsername = "root"
	rootPassword = "root"
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
			URL:      "http://repo1",
			RepoName: "repo1",
			Error:    nil,
		},
		Members: []entity.Member{
			{
				UserID:      primitive.NewObjectID().Hex(),
				AccessLevel: entity.AccessLevelAdmin,
				AddedDate:   testTimeExample,
			},
		},
		MinioAccessKey: entity.MinioAccessKey{
			AccessKey: "project-project1",
			SecretKey: "accessKey1",
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
			URL:      "http://repo2",
			RepoName: "repo2",
			Error:    nil,
		},
		Members: []entity.Member{
			{
				UserID:      primitive.NewObjectID().Hex(),
				AccessLevel: entity.AccessLevelAdmin,
				AddedDate:   testTimeExample,
			},
		},
		MinioAccessKey: entity.MinioAccessKey{
			AccessKey: "project-project2",
			SecretKey: "accessKey2",
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

var userExamples = map[string]entity.User{
	"user1": {
		ID:           primitive.NewObjectID().Hex(),
		Email:        "email1",
		Username:     "user1",
		Sub:          "d5d70477-5192-4182-b80e-5d34550eb4fe",
		Deleted:      false,
		CreationDate: testTimeExample,
		LastActivity: testTimeExample,
		AccessLevel:  entity.AccessLevelAdmin,
		SSHKey: entity.SSHKey{
			Public:       "publicKey1",
			Private:      "privateKey1",
			CreationDate: testTimeExample,
		},
		MinioAccessKey: entity.MinioAccessKey{
			AccessKey: "accessKey1",
			SecretKey: "secretKey1",
		},
	},
	"user2": {
		ID:           primitive.NewObjectID().Hex(),
		Email:        "email2",
		Username:     "user2",
		Sub:          "4c5c3da6-2847-4a8a-9f68-9532fe559b6d",
		Deleted:      false,
		CreationDate: testTimeExample,
		LastActivity: testTimeExample,
		AccessLevel:  entity.AccessLevelAdmin,
		SSHKey: entity.SSHKey{
			Public:       "publicKey2",
			Private:      "privateKey2",
			CreationDate: testTimeExample,
		},
	},
}

var screenConfigCreateProjectSettingsExample = entity.CreateProjectSettings{
	MLFlowStorage: []string{"1Gi", "2Gi"},
}

type TestSuite struct {
	suite.Suite
	mongoDBContainer        testcontainers.Container
	mongoClient             *mongodbutils.MongoDB
	capabilitiesRepo        *mongodb.CapabilitiesRepo
	projectRepo             *mongodb.ProjectRepo
	runtimeRepo             *mongodb.RuntimeRepo
	userActivityRepo        *mongodb.UserActivityRepo
	userRepo                *mongodb.UserRepo
	screenConfigurationRepo *mongodb.ScreenConfigurationRepo
}

func TestProcessRepositoryTestSuite(t *testing.T) {
	suite.Run(t, new(TestSuite))
}

func (s *TestSuite) SetupSuite() {
	ctx := context.Background()

	zapLog, err := zap.NewDevelopment()
	s.Require().NoError(err)

	logger := zapr.NewLogger(zapLog)

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
	mongoClient, err := mongodbutils.NewMongoDB(logger, uri)
	s.Require().NoError(err)

	s.mongoDBContainer = mongoDBContainer
	s.mongoClient = mongoClient
	s.capabilitiesRepo = mongodb.NewCapabilitiesRepo(logger, mongoClient, dbName)
	s.projectRepo = mongodb.NewProjectRepo(logger, mongoClient, dbName)
	s.runtimeRepo = mongodb.NewRuntimeRepo(logger, mongoClient, dbName)
	s.userActivityRepo = mongodb.NewUserActivityRepo(logger, mongoClient, dbName)
	s.userRepo = mongodb.NewUserRepo(logger, mongoClient, dbName)
	s.screenConfigurationRepo = mongodb.NewScreenConfigurationRepo(logger, mongoClient, dbName)

	monkey.Patch(time.Now, func() time.Time {
		return time.Date(2021, 1, 1, 0, 0, 0, 0, time.UTC)
	})
}

func (s *TestSuite) TearDownSuite() {
	monkey.UnpatchAll()
	s.Require().NoError(s.mongoDBContainer.Terminate(context.Background()))
}

func (s *TestSuite) SetupTest() {
	// setup capabilities
	for _, c := range capabilitiesExamples {
		_, err := s.capabilitiesRepo.Create(context.Background(), c)
		s.Require().NoError(err)
	}

	// setup projects
	for _, p := range projectExamples {
		_, err := s.projectRepo.Create(context.Background(), p)
		s.Require().NoError(err)
	}

	// setup runtimes
	for _, r := range runtimeExamples {
		_, err := s.runtimeRepo.Create(context.Background(), r)
		s.Require().NoError(err)
	}

	// setup users
	for _, u := range userExamples {
		_, err := s.userRepo.Create(context.Background(), u)
		s.Require().NoError(err)
	}

	// setup screen configuration
	err := s.screenConfigurationRepo.CreateCreateProjectSettings(context.Background(), screenConfigCreateProjectSettingsExample)
	s.Require().NoError(err)
}

func (s *TestSuite) TearDownTest() {
	err := s.mongoClient.DropDatabase(dbName)
	s.Require().NoError(err)
}

func (s *TestSuite) TestCapabilitiesGet_OK() {
	ctx := context.Background()

	expectedCapability := capabilitiesExamples["capability1"]

	actualCapability, err := s.capabilitiesRepo.Get(ctx, expectedCapability.ID)
	s.Require().NoError(err)

	s.Equal(expectedCapability, actualCapability)
}

func (s *TestSuite) TestCapabilitiesGet_NoID() {
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

func (s *TestSuite) TestCapabilitiesFindAll_OK() {
	ctx := context.Background()

	actualCapabilities, err := s.capabilitiesRepo.FindAll(ctx)
	s.Require().NoError(err)

	s.Len(actualCapabilities, 2)
}

func (s *TestSuite) TestProjectGet_OK() {
	ctx := context.Background()

	expectedProject := projectExamples["project1"]

	actualProject, err := s.projectRepo.Get(ctx, expectedProject.ID)
	s.Require().NoError(err)

	s.Equal(expectedProject, actualProject)
}

func (s *TestSuite) TestProjectGet_NotFound() {
	ctx := context.Background()

	_, err := s.projectRepo.Get(ctx, "notfound")
	s.Require().Error(err)
	s.Equal(entity.ErrProjectNotFound, err)
}

func (s *TestSuite) TestProjectFindAll_OK() {
	ctx := context.Background()

	actualProjects, err := s.projectRepo.FindAll(ctx)
	s.Require().NoError(err)

	s.Len(actualProjects, 2)
}

func (s *TestSuite) TestProjectAddMembers_OK() {
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

	s.Len(actualProject.Members, len(project.Members)+len(members))
}

func (s *TestSuite) TestProjectRemoveMembers_OK() {
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

	s.Len(actualProject.Members, len(project.Members)+len(members))

	err = s.projectRepo.RemoveMembers(ctx, project.ID, users)
	s.Require().NoError(err)

	actualProject, err = s.projectRepo.Get(ctx, project.ID)
	s.Require().NoError(err)

	s.Len(actualProject.Members, len(project.Members))
}

func (s *TestSuite) TestProjectUpdateMembersAccessLevel_OK() {
	ctx := context.Background()

	project := projectExamples["project1"]

	actualProject, err := s.projectRepo.Get(ctx, project.ID)
	s.Require().NoError(err)

	s.Require().GreaterOrEqual(len(actualProject.Members), 1)
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

func (s *TestSuite) TestProjectUpdateName_OK() {
	ctx := context.Background()

	project := projectExamples["project1"]
	newName := "newName"

	err := s.projectRepo.UpdateName(ctx, project.ID, newName)
	s.Require().NoError(err)

	actualProject, err := s.projectRepo.Get(ctx, project.ID)
	s.Require().NoError(err)

	s.Equal(newName, actualProject.Name)
}

func (s *TestSuite) TestProjectUpdateDescription_OK() {
	ctx := context.Background()

	project := projectExamples["project1"]
	newDescription := "newDescription"

	err := s.projectRepo.UpdateDescription(ctx, project.ID, newDescription)
	s.Require().NoError(err)

	actualProject, err := s.projectRepo.Get(ctx, project.ID)
	s.Require().NoError(err)

	s.Equal(newDescription, actualProject.Description)
}

func (s *TestSuite) TestProjectUpdateArchived_OK() {
	ctx := context.Background()

	project := projectExamples["project1"]
	newArchived := true

	err := s.projectRepo.UpdateArchived(ctx, project.ID, newArchived)
	s.Require().NoError(err)

	actualProject, err := s.projectRepo.Get(ctx, project.ID)
	s.Require().NoError(err)

	s.Equal(newArchived, actualProject.Archived)
}

func (s *TestSuite) TestProjectDeleteOne_OK() {
	ctx := context.Background()

	_, err := s.projectRepo.Get(ctx, projectExamples["project1"].ID)
	s.Require().NoError(err)

	err = s.projectRepo.DeleteOne(ctx, projectExamples["project1"].ID)
	s.Require().NoError(err)

	_, err = s.projectRepo.Get(ctx, projectExamples["project1"].ID)
	s.Require().Error(err)
	s.Equal(entity.ErrProjectNotFound, err)
}

func (s *TestSuite) TestProjectDeleteOne_NoPreviousProject() {
	ctx := context.Background()

	err := s.projectRepo.DeleteOne(ctx, "notfound")
	s.Require().Error(err)
}

func (s *TestSuite) TestRuntimeGet_OK() {
	ctx := context.Background()

	expectedRuntime := runtimeExamples["runtime1"]

	actualRuntime, err := s.runtimeRepo.Get(ctx, expectedRuntime.ID)
	s.Require().NoError(err)

	s.Equal(expectedRuntime, actualRuntime)
}

func (s *TestSuite) TestRuntimeGet_NotValidHex() {
	ctx := context.Background()

	_, err := s.runtimeRepo.Get(ctx, "notvalid")
	s.Require().Error(err)
	s.Equal(primitive.ErrInvalidHex, err)
}

func (s *TestSuite) TestRuntimeGet_NotFound() {
	ctx := context.Background()

	_, err := s.runtimeRepo.Get(ctx, primitive.NewObjectID().Hex())
	s.Require().Error(err)
	s.Equal(entity.ErrRuntimeNotFound, err)
}

func (s *TestSuite) TestRuntimeFindAll_OK() {
	ctx := context.Background()

	actualRuntimes, err := s.runtimeRepo.FindAll(ctx)
	s.Require().NoError(err)

	s.Len(actualRuntimes, 2)
}

func (s *TestSuite) TestUserActivityCreate_OK() {
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

func (s *TestSuite) TestUserGet_OK() {
	ctx := context.Background()

	expectedUser := userExamples["user1"]

	actualUser, err := s.userRepo.Get(ctx, expectedUser.ID)
	s.Require().NoError(err)

	s.Equal(expectedUser, actualUser)
}

func (s *TestSuite) TestUserGet_NotValidHex() {
	ctx := context.Background()

	_, err := s.userRepo.Get(ctx, "notfound")
	s.Require().Error(err)
	s.Equal(primitive.ErrInvalidHex, err)
}

func (s *TestSuite) TestUserGet_NotFound() {
	ctx := context.Background()

	_, err := s.userRepo.Get(ctx, primitive.NewObjectID().Hex())
	s.Require().Error(err)
	s.Equal(entity.ErrUserNotFound, err)
}

func (s *TestSuite) TestUserGetByUsername_OK() {
	ctx := context.Background()

	expectedUser := userExamples["user1"]

	actualUser, err := s.userRepo.GetByUsername(ctx, expectedUser.Username)
	s.Require().NoError(err)

	s.Equal(expectedUser, actualUser)
}

func (s *TestSuite) TestUserGetByUsername_NotFound() {
	ctx := context.Background()

	_, err := s.userRepo.GetByUsername(ctx, "notfound")
	s.Require().Error(err)
	s.Equal(entity.ErrUserNotFound, err)
}

func (s *TestSuite) TestUserGetByEmail_OK() {
	ctx := context.Background()

	expectedUser := userExamples["user1"]

	actualUser, err := s.userRepo.GetByEmail(ctx, expectedUser.Email)
	s.Require().NoError(err)

	s.Equal(expectedUser, actualUser)
}

func (s *TestSuite) TestUserGetByEmail_NotFound() {
	ctx := context.Background()

	_, err := s.userRepo.GetByEmail(ctx, "notfound")
	s.Require().Error(err)
	s.Equal(entity.ErrUserNotFound, err)
}

func (s *TestSuite) TestUserGetBySub_OK() {
	ctx := context.Background()

	expectedUser := userExamples["user1"]

	actualUser, err := s.userRepo.GetBySub(ctx, expectedUser.Sub)
	s.Require().NoError(err)

	s.Equal(expectedUser, actualUser)
}

func (s *TestSuite) TestUserGetBySub_NotFound() {
	ctx := context.Background()

	_, err := s.userRepo.GetBySub(ctx, "notfound")
	s.Require().Error(err)
	s.Equal(entity.ErrUserNotFound, err)
}

func (s *TestSuite) TestUserFindAll_OK() {
	ctx := context.Background()

	actualUsers, err := s.userRepo.FindAll(ctx, false)
	s.Require().NoError(err)

	s.Len(actualUsers, 2)
}

func (s *TestSuite) TestUserFindAllPlusDeleted_OK() {
	ctx := context.Background()

	deletedUser := userExamples["user1"]
	deletedUser.ID = primitive.NewObjectID().Hex()
	deletedUser.Deleted = true

	_, err := s.userRepo.Create(ctx, deletedUser)
	s.Require().NoError(err)

	actualUsers, err := s.userRepo.FindAll(ctx, true)
	s.Require().NoError(err)

	s.Len(actualUsers, 3)
}

func (s *TestSuite) TestUserFindByIDs_OK() {
	ctx := context.Background()

	userIDs := []string{
		userExamples["user1"].ID,
		userExamples["user2"].ID,
	}

	actualUsers, err := s.userRepo.FindByIDs(ctx, userIDs)
	s.Require().NoError(err)

	s.Len(actualUsers, 2)

	userIDs = []string{
		userExamples["user1"].ID,
	}

	actualUsers, err = s.userRepo.FindByIDs(ctx, userIDs)
	s.Require().NoError(err)

	s.Len(actualUsers, 1)
}

func (s *TestSuite) TestUserUpdateAccessLevel_OK() {
	ctx := context.Background()

	user := userExamples["user1"]
	newAccessLevel := entity.AccessLevelViewer

	s.NotEqual(newAccessLevel, user.AccessLevel)

	err := s.userRepo.UpdateAccessLevel(ctx, []string{user.ID}, newAccessLevel)
	s.Require().NoError(err)

	actualUser, err := s.userRepo.Get(ctx, user.ID)
	s.Require().NoError(err)

	s.Equal(newAccessLevel, actualUser.AccessLevel)
}

func (s *TestSuite) TestUserUpdateDeleted_OK() {
	ctx := context.Background()

	user := userExamples["user1"]
	newDeleted := true

	s.NotEqual(newDeleted, user.Deleted)

	err := s.userRepo.UpdateDeleted(ctx, user.Username, newDeleted)
	s.Require().NoError(err)

	actualUser, err := s.userRepo.Get(ctx, user.ID)
	s.Require().NoError(err)

	s.Equal(newDeleted, actualUser.Deleted)
}

func (s *TestSuite) TestUserUpdateSSHKey_OK() {
	ctx := context.Background()

	user := userExamples["user1"]
	newSSHKey := entity.SSHKey{
		Public:       "newPublicKey",
		Private:      "newPrivateKey",
		CreationDate: testTimeExample,
	}

	err := s.userRepo.UpdateSSHKey(ctx, user.Username, newSSHKey)
	s.Require().NoError(err)

	actualUser, err := s.userRepo.Get(ctx, user.ID)
	s.Require().NoError(err)

	s.Equal(newSSHKey, actualUser.SSHKey)
}

func (s *TestSuite) TestUserUpdateEmail_OK() {
	ctx := context.Background()

	user := userExamples["user1"]
	newEmail := "newEmail"

	err := s.userRepo.UpdateEmail(ctx, user.Username, newEmail)
	s.Require().NoError(err)

	actualUser, err := s.userRepo.Get(ctx, user.ID)
	s.Require().NoError(err)

	s.Equal(newEmail, actualUser.Email)
}

func (s *TestSuite) TestUserUpdateUsername_OK() {
	ctx := context.Background()

	user := userExamples["user1"]
	newUsername := "newUsername"

	err := s.userRepo.UpdateUsername(ctx, user.Email, newUsername)
	s.Require().NoError(err)

	actualUser, err := s.userRepo.Get(ctx, user.ID)
	s.Require().NoError(err)

	s.Equal(newUsername, actualUser.Username)
}

func (s *TestSuite) TestUserUpdateSub_OK() {
	ctx := context.Background()

	user := userExamples["user1"]
	newSub := "e8fc5009-d220-427f-bf8c-dd63b69ca6f5"

	err := s.userRepo.UpdateSub(ctx, user.Username, newSub)
	s.Require().NoError(err)

	actualUser, err := s.userRepo.Get(ctx, user.ID)
	s.Require().NoError(err)

	s.Equal(newSub, actualUser.Sub)
}

func (s *TestSuite) TestUserEnsureIndexes_OK() {
	collection := s.mongoClient.CreateCollection(dbName, userCollName)
	indexView := collection.Indexes()

	cursor, err := indexView.List(context.Background())
	s.Require().NoError(err)

	var indexes []string

	for cursor.Next(context.Background()) {
		var index bson.M
		err := cursor.Decode(&index)
		s.Require().NoError(err)

		name, ok := index["name"].(string)
		if !ok {
			continue
		}

		indexes = append(indexes, name)
	}

	s.Len(indexes, 1)
	s.Contains(indexes, "_id_")
	s.NotContains(indexes, "email_1")
	s.NotContains(indexes, "username_1")
	s.NotContains(indexes, "sub_1")

	err = s.userRepo.EnsureIndexes()
	s.Require().NoError(err)

	// check if index has been created
	indexView = collection.Indexes()
	cursor, err = indexView.List(context.Background())
	s.Require().NoError(err)

	indexes = []string{}

	for cursor.Next(context.Background()) {
		var index bson.M
		err := cursor.Decode(&index)
		s.Require().NoError(err)

		name, ok := index["name"].(string)
		if !ok {
			continue
		}

		indexes = append(indexes, name)
	}

	s.Len(indexes, 4)
	s.Contains(indexes, "_id_")
	s.Contains(indexes, "email_1")
	s.Contains(indexes, "username_1")
	s.Contains(indexes, "sub_1")
}

func (s *TestSuite) TestScreenConfiguration_CreateProjectSettings_OK() {
	ctx := context.Background()

	actualCreateProjectSettings, err := s.screenConfigurationRepo.GetCreateProjectSettings(ctx)
	s.Require().NoError(err)

	s.Equal(screenConfigCreateProjectSettingsExample, actualCreateProjectSettings)
}
