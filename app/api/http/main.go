package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/transport"
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
	"github.com/konstellation-io/kdl-server/app/api/usecase/configmap"
	"github.com/konstellation-io/kdl-server/app/api/usecase/project"
	"github.com/konstellation-io/kdl-server/app/api/usecase/runtime"
	"github.com/konstellation-io/kdl-server/app/api/usecase/user"
)

type deps struct {
	minioService  minioservice.MinioService
	k8sClient     k8s.ClientInterface
	mongodbClient *mongodbutils.MongoDB
}

func loadDependencies(logger logr.Logger, cfg config.Config) deps {
	// Setting minio service
	minioService, err := minioservice.NewMinioService(
		logger, cfg.Minio.Endpoint, cfg.Minio.AccessKey, cfg.Minio.SecretKey,
	)
	if err != nil {
		logger.Error(err, "Error connecting to Minio")
		os.Exit(1)
	}

	// Setting k8s client
	k8sClient, err := k8s.NewK8sClient(logger, cfg)
	if err != nil {
		logger.Error(err, "Error creating k8s client")
		os.Exit(1)
	}

	// Setting mongodb client
	mongodbClient, err := mongodbutils.NewMongoDB(logger, cfg.MongoDB.URI)
	if err != nil {
		logger.Error(err, "Error connecting to MongoDB")
		os.Exit(1)
	}

	return deps{
		minioService:  minioService,
		k8sClient:     k8sClient,
		mongodbClient: mongodbClient,
	}
}

type dbRepos struct {
	capabilitiesRepo capabilities.Repository
	projectRepo      project.Repository
	runtimeRepo      runtime.Repository
	userActivityRepo project.UserActivityRepo
	userRepo         user.Repository
}

func loadRepos(logger logr.Logger, dbName string, mongodbClient *mongodbutils.MongoDB) dbRepos {
	return dbRepos{
		capabilitiesRepo: mongodb.NewCapabilitiesRepo(logger, mongodbClient, dbName),
		projectRepo:      mongodb.NewProjectRepo(logger, mongodbClient, dbName),
		runtimeRepo:      mongodb.NewRuntimeRepo(logger, mongodbClient, dbName),
		userActivityRepo: mongodb.NewUserActivityRepo(logger, mongodbClient, dbName),
		userRepo:         mongodb.NewUserRepo(logger, mongodbClient, dbName),
	}
}

type useCaseInteractors struct {
	capabilitiesInteractor capabilities.UseCase
	projectInteractor      project.UseCase
	runtimeInteractor      runtime.UseCase
	userInteractor         user.UseCase
	configmapInteractor    configmap.UseCase
}

func loadInteractors(
	logger logr.Logger,
	cfg config.Config,
	k8sClient k8s.ClientInterface,
	minioService minioservice.MinioService,
	repos dbRepos,
) useCaseInteractors {
	realClock := clock.NewRealClock()
	sshHelper := sshhelper.NewGenerator(logger)

	capabilitiesInteractor := capabilities.NewInteractor(logger, cfg, repos.capabilitiesRepo, k8sClient)
	projectInteractor := project.NewInteractor(logger, k8sClient, minioService, realClock, repos.projectRepo, repos.userActivityRepo)
	runtimeInteractor := runtime.NewInteractor(logger, k8sClient, repos.runtimeRepo)
	userInteractor := user.NewInteractor(logger, cfg, repos.userRepo, repos.runtimeRepo, repos.capabilitiesRepo,
		sshHelper, realClock, k8sClient)
	configmapInteractor := configmap.NewInteractor(logger, cfg, k8sClient, projectInteractor, userInteractor)

	return useCaseInteractors{
		capabilitiesInteractor: capabilitiesInteractor,
		projectInteractor:      projectInteractor,
		runtimeInteractor:      runtimeInteractor,
		userInteractor:         userInteractor,
		configmapInteractor:    configmapInteractor,
	}
}

func main() {
	// Load configuration
	cfg := config.NewConfig()

	// Setup zap logger
	zapLog, err := zap.NewDevelopment()
	if err != nil {
		log.Fatal(err)
	}

	logger := zapr.NewLogger(zapLog)

	// Load third-party dependencies, repos and interactors
	dependencies := loadDependencies(logger, cfg)
	defer dependencies.mongodbClient.Disconnect()

	repos := loadRepos(logger, cfg.MongoDB.DBName, dependencies.mongodbClient)
	interactors := loadInteractors(logger, cfg, dependencies.k8sClient, dependencies.minioService, repos)

	// Execute actions before starting the HTTP server
	actionsBeforeStartingHTTPServer(logger, repos, interactors)

	// Start the HTTP server
	startHTTPServer(logger, cfg, repos, interactors, dependencies)
}

func actionsBeforeStartingHTTPServer(logger logr.Logger, repos dbRepos, interactors useCaseInteractors) {
	// Ensure db indexes in user collection
	err := repos.userRepo.EnsureIndexes()
	if err != nil {
		logger.Error(err, "Error creating indexes for users")
	}

	// Create service accounts for users
	if err = interactors.userInteractor.SynchronizeServiceAccountsForUsers(); err != nil {
		logger.Error(err, "Unexpected error creating serviceAccount for users")
	}

	// Start watching ConfigMaps
	go func() {
		err := interactors.configmapInteractor.WatchConfigMapTemplates(context.Background())
		if err != nil {
			logger.Error(err, "Error watching ConfigMaps")
		}
	}()
}

func startHTTPServer(
	logger logr.Logger,
	cfg config.Config,
	repos dbRepos,
	interactors useCaseInteractors,
	dedependencies deps,
) {
	const apiQueryPath = "/api/query"

	// Load graphQL resolvers
	resolvers := graph.NewResolver(
		logger,
		cfg,
		interactors.projectInteractor,
		interactors.userInteractor,
		interactors.runtimeInteractor,
		interactors.capabilitiesInteractor,
	)

	srv := handler.New(generated.NewExecutableSchema(generated.Config{Resolvers: resolvers}))
	srv.AddTransport(transport.Websocket{
		KeepAlivePingInterval: 30 * time.Second,
	})
	srv.AddTransport(transport.GET{})
	srv.AddTransport(transport.POST{})
	srv.AddTransport(transport.MultipartForm{})

	pg := playground.Handler("GraphQL playground", apiQueryPath)
	fs := http.FileServer(http.Dir(cfg.StaticFilesPath))

	authController := controller.NewAuthController(logger, repos.userRepo, repos.projectRepo)
	healthzController := controller.NewHealthzController(
		dedependencies.minioService,
		dedependencies.k8sClient,
		dedependencies.mongodbClient,
	)

	http.Handle("/", fs)
	http.Handle("/api/playground", middleware.AuthMiddleware(pg, interactors.userInteractor))
	http.Handle(apiQueryPath, middleware.AuthMiddleware(
		dataloader.Middleware(repos.userRepo, srv), interactors.userInteractor),
	)
	http.HandleFunc("/api/auth/project", authController.HandleProjectAuth)
	http.HandleFunc("/healthz", healthzController.HandleHealthz)

	logger.Info("Server running", "port", cfg.Port)

	server := &http.Server{
		Addr:         ":" + cfg.Port,
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
