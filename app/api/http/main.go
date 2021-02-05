package main

import (
	"net/http"
	"os"
	"strings"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/graph/generated"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/repository"
	"github.com/konstellation-io/kdl-server/app/api/pkg/clock"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
	"github.com/konstellation-io/kdl-server/app/api/pkg/sshhelper"
	"github.com/konstellation-io/kdl-server/app/api/usecase/user"

	"github.com/konstellation-io/kdl-server/app/api/infrastructure/config"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/graph"
	"github.com/konstellation-io/kdl-server/app/api/pkg/mongodb"
	"github.com/konstellation-io/kdl-server/app/api/usecase/project"
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
	realClock := clock.NewRealClock()
	sshHelper := sshhelper.NewGenerator(logger)

	mongo := mongodb.NewMongoDB(logger)

	mongodbClient, err := mongo.Connect(cfg.MongoDB.URI)
	if err != nil {
		logger.Errorf("Error connecting to MongoDB: %s", err)
		os.Exit(1)
	}

	defer mongo.Disconnect()

	projectRepo := repository.NewProjectMongoDBRepo(logger, mongodbClient, cfg.MongoDB.DBName)
	userRepo := repository.NewUserMongoDBRepo(logger, mongodbClient, cfg.MongoDB.DBName)

	err = userRepo.EnsureIndexes()
	if err != nil {
		logger.Errorf("Error creating indexes for users: %s", err)
	}

	resolvers := graph.NewResolver(
		project.NewInteractor(logger, projectRepo, realClock),
		user.NewInteractor(logger, userRepo, sshHelper, realClock),
	)

	startHTTPServer(logger, cfg.Port, cfg.StaticFilesPath, resolvers)
}

func startHTTPServer(logger logging.Logger, port, staticFilesPath string, resolvers generated.ResolverRoot) {
	const apiQueryPath = "/api/query"

	srv := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: resolvers}))
	fs := http.FileServer(http.Dir(staticFilesPath))

	http.Handle("/", fs)
	http.Handle("/api/playground", playground.Handler("GraphQL playground", apiQueryPath))
	http.Handle(apiQueryPath, srv)

	logger.Infof("Server running at port %s", port)

	err := http.ListenAndServe(":"+port, nil)
	if err != nil {
		logger.Errorf("Unexpected error: %s", err)
	}
}
