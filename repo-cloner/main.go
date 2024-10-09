package main

import (
	"os"
	"strings"

	"github.com/konstellation-io/kdl-server/repo-cloner/cloner"
	"github.com/konstellation-io/kdl-server/repo-cloner/config"
	"github.com/konstellation-io/kdl-server/repo-cloner/repository"

	"github.com/konstellation-io/kdl-server/app/api/pkg/mongodbutils"
	"github.com/konstellation-io/kre/libs/simplelogger"
)

func main() {
	cfg := config.NewConfig()

	var level simplelogger.LogLevel

	switch strings.ToLower(cfg.LogLevel) {
	case "debug":
		level = simplelogger.LevelDebug
	case "info":
		level = simplelogger.LevelInfo
	case "warn":
		level = simplelogger.LevelWarn
	case "error":
		level = simplelogger.LevelError
	}

	logger := simplelogger.New(level)
	mongoManager := mongodbutils.NewMongoDB(logger)

	mongodbClient, err := mongoManager.Connect(cfg.MongoDB.URI)
	if err != nil {
		logger.Errorf("Error connecting to MongoDB: %s", err)
		os.Exit(1)
	}

	defer mongoManager.Disconnect()

	projectRepo := repository.NewProjectMongoDBRepo(cfg, logger, mongodbClient)
	userRepo := repository.NewUserMongoDBRepo(cfg, logger, mongodbClient)

	repoCloner := cloner.NewUserRepoCloner(cfg, logger, projectRepo, userRepo)
	repoCloner.Start()
}
