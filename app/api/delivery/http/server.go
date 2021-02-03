package http

import (
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/graph"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/graph/generated"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/logging"
	"net/http"
)

func Start(logger logging.Logger, port, staticFilesPath string, resolvers *graph.Resolver) {
	srv := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: resolvers}))

	fs := http.FileServer(http.Dir(staticFilesPath))
	http.Handle("/", fs)

	const apiQueryPath = "/api/v1/query"
	http.Handle("/api/v1/playground", playground.Handler("GraphQL playground", apiQueryPath))
	http.Handle(apiQueryPath, srv)

	logger.Infof("Server running at port %s", port)

	err := http.ListenAndServe(":"+port, nil)
	if err != nil {
		logger.Errorf("Unexpected error: %s", err)
	}
}
