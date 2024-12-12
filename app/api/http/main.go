package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/go-logr/logr"
	"github.com/go-logr/zapr"
	"go.uber.org/zap"

	"github.com/konstellation-io/kdl-server/app/api/http/controller"
	"github.com/konstellation-io/kdl-server/app/api/http/middleware"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/config"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/dataloader"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/graph"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/graph/generated"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/k8s"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/minioservice"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/mongodb"
	"github.com/konstellation-io/kdl-server/app/api/pkg/clock"
	"github.com/konstellation-io/kdl-server/app/api/pkg/mongodbutils"
	"github.com/konstellation-io/kdl-server/app/api/pkg/sshhelper"
	"github.com/konstellation-io/kdl-server/app/api/usecase/capabilities"
	"github.com/konstellation-io/kdl-server/app/api/usecase/project"
	"github.com/konstellation-io/kdl-server/app/api/usecase/runtime"
	"github.com/konstellation-io/kdl-server/app/api/usecase/user"
)

func main() {
	cfg := config.NewConfig()

	zapLog, err := zap.NewDevelopment()
	if err != nil {
		log.Fatal(err)
	}

	logger := zapr.NewLogger(zapLog)

	realClock := clock.NewRealClock()
	sshHelper := sshhelper.NewGenerator(logger)

	minioService, err := minioservice.NewMinioService(
		logger, cfg.Minio.Endpoint, cfg.Minio.AccessKey, cfg.Minio.SecretKey,
	)
	if err != nil {
		logger.Error(err, "Error connecting to Minio")
		os.Exit(1)
	}

	k8sClient, err := k8s.NewK8sClient(logger, cfg)
	if err != nil {
		logger.Error(err, "Error creating k8s client")
		os.Exit(1)
	}

	mongo := mongodbutils.NewMongoDB(logger)

	mongodbClient, err := mongo.Connect(cfg.MongoDB.URI)
	if err != nil {
		logger.Error(err, "Error connecting to MongoDB")
		os.Exit(1)
	}

	defer mongo.Disconnect()

	capabilitiesRepo := mongodb.NewCapabilitiesRepo(logger, mongodbClient, cfg.MongoDB.DBName)
	projectRepo := mongodb.NewProjectRepo(logger, mongodbClient, cfg.MongoDB.DBName)
	runtimeRepo := mongodb.NewRuntimeRepo(logger, mongodbClient, cfg.MongoDB.DBName)
	userActivityRepo := mongodb.NewUserActivityRepo(logger, mongodbClient, cfg.MongoDB.DBName)
	userRepo := mongodb.NewUserRepo(logger, mongodbClient, cfg.MongoDB.DBName)

	err = userRepo.EnsureIndexes()
	if err != nil {
		logger.Error(err, "Error creating indexes for users")
	}

	userInteractor := user.NewInteractor(logger, cfg, userRepo, runtimeRepo, capabilitiesRepo,
		sshHelper, realClock, k8sClient)

	if err = userInteractor.SynchronizeServiceAccountsForUsers(); err != nil {
		logger.Error(err, "Unexpected error creating serviceAccount for users")
	}

	projectDeps := &project.InteractorDeps{
		Logger:           logger,
		Repo:             projectRepo,
		Clock:            realClock,
		MinioService:     minioService,
		K8sClient:        k8sClient,
		UserActivityRepo: userActivityRepo,
	}

	projectInteractor := project.NewInteractor(projectDeps)

	runtimeInteractor := runtime.NewInteractor(logger, k8sClient, runtimeRepo)

	capabilitiesInteractor := capabilities.NewInteractor(logger, cfg, capabilitiesRepo, k8sClient)

	resolvers := graph.NewResolver(
		logger,
		cfg,
		projectInteractor,
		userInteractor,
		runtimeInteractor,
		capabilitiesInteractor,
	)

	startHTTPServer(logger, cfg.Port, cfg.StaticFilesPath, resolvers, userRepo, userInteractor, projectRepo)
}

func startHTTPServer(
	logger logr.Logger,
	port,
	staticFilesPath string,
	resolvers generated.ResolverRoot,
	userRepo user.Repository,
	userInteractor user.UseCase,
	projectRepo project.Repository,
) {
	const apiQueryPath = "/api/query"

	srv := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: resolvers}))
	pg := playground.Handler("GraphQL playground", apiQueryPath)
	fs := http.FileServer(http.Dir(staticFilesPath))

	authController := controller.NewAuthController(logger, userRepo, projectRepo)

	http.Handle("/", fs)
	http.Handle("/api/playground", middleware.AuthMiddleware(pg, userInteractor))
	http.Handle(apiQueryPath, middleware.AuthMiddleware(dataloader.Middleware(userRepo, srv), userInteractor))
	http.HandleFunc("/api/auth/project", authController.HandleProjectAuth)

	logger.Info("Server running", "port", port)

	server := &http.Server{
		Addr:         ":" + port,
		Handler:      nil,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  30 * time.Second,
	}

	err := server.ListenAndServe()
	if err != nil {
		logger.Error(err, "Unexpected error")
		os.Exit(1)
	}
}
