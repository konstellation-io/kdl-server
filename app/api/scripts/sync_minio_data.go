package main

import (
	"log"
	"os"

	"github.com/go-logr/zapr"
	"go.uber.org/zap"

	"github.com/konstellation-io/kdl-server/app/api/infrastructure/config"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/minioadminservice"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/mongodb"
	"github.com/konstellation-io/kdl-server/app/api/pkg/kdlutil"
	"github.com/konstellation-io/kdl-server/app/api/pkg/mongodbutils"
	"github.com/konstellation-io/kdl-server/app/api/scripts/minio"
)

func main() {
	// Load configuration
	cfg := config.NewConfig()

	// Setup zap logger
	zapLog, err := zap.NewDevelopment()
	if err != nil {
		log.Fatal(err)
	}

	logger := zapr.NewLogger(zapLog)

	// set random generator
	randomGenerator := kdlutil.NewRandomGenerator()

	// set minio admin service
	minioAdminService, err := minioadminservice.NewMinioAdminService(
		logger, cfg.Minio.Endpoint, cfg.Minio.AccessKey, cfg.Minio.SecretKey,
	)
	if err != nil {
		logger.Error(err, "Error connecting to Minio for administration")
		os.Exit(1)
	}

	// set mongodb client
	mongodbClient, err := mongodbutils.NewMongoDB(logger, cfg.MongoDB.URI)
	if err != nil {
		logger.Error(err, "Error connecting to MongoDB")
		os.Exit(1)
	}
	defer mongodbClient.Disconnect()

	// set project and user repositories
	projectRepo := mongodb.NewProjectRepo(logger, mongodbClient, cfg.MongoDB.DBName)
	userRepo := mongodb.NewUserRepo(logger, mongodbClient, cfg.MongoDB.DBName)

	err = minio.SyncUsers(logger, userRepo, minioAdminService, randomGenerator)
	if err != nil {
		logger.Error(err, "Error syncing users")

		defer os.Exit(1)
	}

	err = minio.SyncProjects(logger, projectRepo, userRepo, minioAdminService, randomGenerator)
	if err != nil {
		logger.Error(err, "Error syncing projects")

		defer os.Exit(1)
	}
}
