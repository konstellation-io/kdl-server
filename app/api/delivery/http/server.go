package http

import (
	"net/http"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/graph/generated"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/logging"
)

func Start(logger logging.Logger, port, staticFilesPath string, resolvers generated.ResolverRoot) {
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
