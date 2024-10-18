package main

import (
	"log"
	"os"

	"github.com/go-logr/zapr"
	"go.uber.org/zap"

	"github.com/konstellation-io/kdl-server/repo-cloner/cloner"
	"github.com/konstellation-io/kdl-server/repo-cloner/config"
	"github.com/konstellation-io/kdl-server/repo-cloner/repository"
	"github.com/konstellation-io/kdl-server/repo-cloner/utils"
)

func main() {
	cfg := config.NewConfig()

	zapLog, err := zap.NewDevelopment()
	if err != nil {
		log.Fatal(err)
	}
	logger := zapr.NewLogger(zapLog)

	mongoManager := utils.NewMongoDB(logger)

	mongodbClient, err := mongoManager.Connect(cfg.MongoDB.URI)
	if err != nil {
		logger.Error(err, "Error connecting to MongoDB")
		os.Exit(1)
	}
	defer mongoManager.Disconnect()

	projectRepo := repository.NewProjectMongoDBRepo(cfg, logger, mongodbClient)
	userRepo := repository.NewUserMongoDBRepo(cfg, logger, mongodbClient)

	repoCloner := cloner.NewUserRepoCloner(cfg, logger, projectRepo, userRepo)
	repoCloner.Start()
}
