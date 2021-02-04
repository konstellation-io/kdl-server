package main

import (
	"os"
	"strings"

	"github.com/konstellation-io/kdl-server/app/api/application/project"
	"github.com/konstellation-io/kdl-server/app/api/delivery/http"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/config"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/graph"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/mongodb"
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

	mongo := mongodb.NewMongoDB(logger)

	mongodbClient, err := mongo.Connect(cfg.MongoDB.URI)
	if err != nil {
		logger.Errorf("Error connecting to MongoDB: %s", err)
		os.Exit(1)
	}

	defer mongo.Disconnect()

	projectRepo := project.NewMongoDBRepo(mongodbClient, cfg.MongoDB.DBName)

	resolvers := graph.NewResolver(
		project.NewInteractor(logger, projectRepo),
	)

	http.Start(logger, cfg.Port, cfg.StaticFilesPath, resolvers)
}
