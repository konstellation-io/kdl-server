package main

import (
	"github.com/konstellation-io/kdl-server/app/api/application/project"
	"github.com/konstellation-io/kdl-server/app/api/delivery/http"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/config"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/graph"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/mongodb"
	"github.com/konstellation-io/kre/libs/simplelogger"
)

func main() {
	cfg := config.NewConfig()

	logger := simplelogger.New(simplelogger.LevelDebug) // TODO get log level from env var

	mongo := mongodb.NewMongoDB(logger)
	mongodbClient := mongo.Connect(cfg.MongoDB.URI)
	defer mongo.Disconnect()

	projectRepo := project.NewProjectRepo(mongodbClient, cfg.MongoDB.DBName)

	resolvers := graph.NewResolver(
		project.NewInteractor(logger, projectRepo),
	)

	http.Start(logger, cfg.Port, cfg.StaticFilesPath, resolvers)
}
