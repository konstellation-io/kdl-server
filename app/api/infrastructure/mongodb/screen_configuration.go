package mongodb

import (
	"context"
	"errors"
	"time"

	"github.com/go-logr/logr"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/pkg/mongodbutils"
	"github.com/konstellation-io/kdl-server/app/api/usecase/screenconfiguration"
)

const (
	screenConfigurationCollName = "screenConfiguration"
	createProjectSettingsID     = "create_project_settings"
)

var (
	errParsingSettings              = errors.New("error parsing settings")
	errParsingSettingsMLFlowStorage = errors.New("error parsing settings.mlflow_storage")
)

type screenConfigurationDTO struct {
	ID       string `bson:"_id"`
	Settings bson.M `bson:"settings"`
}

type ScreenConfigurationRepo struct {
	logger     logr.Logger
	collection *mongo.Collection
}

// ScreenConfigurationRepo implements the screenconfiguration.Repository interface.
var _ screenconfiguration.Repository = (*ScreenConfigurationRepo)(nil)

func NewScreenConfigurationRepo(logger logr.Logger, mongo *mongodbutils.MongoDB, dbName string) *ScreenConfigurationRepo {
	collection := mongo.CreateCollection(dbName, screenConfigurationCollName)

	return &ScreenConfigurationRepo{
		logger,
		collection,
	}
}

func (sc *ScreenConfigurationRepo) GetCreateProjectSettings(ctx context.Context) (entity.CreateProjectSettings, error) {
	ctx, cancel := context.WithTimeout(ctx, 60*time.Second)
	defer cancel()

	dto := screenConfigurationDTO{}
	filters := bson.M{
		"_id": createProjectSettingsID,
	}
	err := sc.collection.FindOne(ctx, filters).Decode(&dto)

	if errors.Is(err, mongo.ErrNoDocuments) {
		return entity.CreateProjectSettings{}, entity.ErrRuntimeNotFound
	}

	return sc.dtoToCreateProjectSettingsEntity(dto)
}

func (sc *ScreenConfigurationRepo) CreateCreateProjectSettings(ctx context.Context, setting entity.CreateProjectSettings) error {
	sc.logger.Info("Creating create project settings", "collection", screenConfigurationCollName)

	dto := sc.createProjectSettingsEntityToDTO(setting)

	_, err := sc.collection.InsertOne(ctx, dto)
	if err != nil {
		if mongodbutils.IsDuplKeyError(err) {
			return entity.ErrDuplicatedUser
		}

		return err
	}

	return nil
}

func (sc *ScreenConfigurationRepo) createProjectSettingsEntityToDTO(cps entity.CreateProjectSettings) screenConfigurationDTO {
	dto := screenConfigurationDTO{
		ID: createProjectSettingsID,
		Settings: bson.M{
			"mlflow_storage": cps.MLFlowStorage,
		},
	}

	return dto
}

func (sc *ScreenConfigurationRepo) dtoToCreateProjectSettingsEntity(dto screenConfigurationDTO) (entity.CreateProjectSettings, error) {
	var mlflowStorage []string

	for k, v := range dto.Settings {
		bsonV, ok := v.(bson.A)
		if !ok {
			return entity.CreateProjectSettings{}, errParsingSettings
		}

		if k == "mlflow_storage" {
			for _, vv := range bsonV {
				strV, okV := vv.(string)
				if !okV {
					return entity.CreateProjectSettings{}, errParsingSettingsMLFlowStorage
				}

				mlflowStorage = append(mlflowStorage, strV)
			}
		}
	}

	cps := entity.CreateProjectSettings{
		MLFlowStorage: mlflowStorage,
	}

	return cps, nil
}
