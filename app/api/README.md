# KDL server API

The KDL server API is a GraphQL API that provides the main functionality for the KDL server.

## Security features

* Non-root user (kdl) execution with configurable UID/GID (default 1000:1000)
* Optimized binary build with debug information removal
* SSH directory permission hardening

## Application

### Build arguments

| Argument | Description                 | Default |
|----------|-----------------------------|---------|
| `USER`   | Non-root user for container | `kdl`   |
| `UID`    | User ID                     | `1000`  |
| `GID`    | Group ID                    | `1000`  |

### Build image

```bash
docker build -t kdl-server:latest .
```

With custom build arguments:

```bash
docker build \
  --build-arg USER=customuser \
  --build-arg UID=1500 \
  --build-arg GID=1500 \
  -t admin-api:latest .
```

### Environment variables

> [!IMPORTANT]
> All environment variables need to be defined, expect the ones
> with a default value. Environment variables are defined in helm chart have
> more priority than the ones by default.

#### KDL server

| Environment variable             | Description                                   | Default value |
|----------------------------------|-----------------------------------------------|---------------|
| `RELEASE_NAME`                   | Release name for the KDL server               |               |
| `KDL_SERVER_MONGODB_NAME`        | MongoDB Database name for the KDL server      | `kdl`         |
| `KDL_SERVER_MONGODB_URI`         | MongoDB URI for the KDL server                |               |
| `KDL_SERVER_PORT`                | Port for the KDL API                          | `8080`        |
| `KDL_SERVER_STATIC_FILES_PATH`   | Path for the static files of the KDL server   | `../public`   |
| `POD_NAMESPACE`                  | Namespace for the KDL server                  |               |
| `PROJECT_FILEBROWSER_URL`        | URL for the File Browser service              |               |
| `PROJECT_MLFLOW_URL`             | URL for the MLflow service                    |               |
| `KUBECONFIG_DOWNLOAD_ENABLED`    | Enable kubeconfig download for the User Tools | `false`       |
| `KUBECONFIG_EXTERNAL_SERVER_URL` | URL for the kubeconfig download service       |               |

#### Keycloak

Keycloak is used for authentication and authorization in the KDL server. The
following environment variables are used to configure the connection to
Keycloak. At the moment, Keycloak connection is optional in KDL server.

| Environment variable             | Description                                 | Default value |
|----------------------------------|---------------------------------------------|---------------|
| `KEYCLOAK_ADMIN_USER`            | Name of the admin user in keycloak          |               |
| `KEYCLOAK_PASSWORD_KEY`          | Password for the admin user in keycloak     |               |
| `KEYCLOAK_ADMIN_CLIENT_ID`       | The name for the client that the admin uses |               |
| `KEYCLOAK_MASTER_REALM`          | Name of the master realm in keycloak        |               |
| `KEYCLOAK_REALM`                 | The realm keycloak uses for KDL namespace   |               |
| `KEYCLOAK_URL`                   | URL for the keycloak service                |               |

#### KnowledgeGalaxy

| Environment variable       | Description                                | Default value |
|----------------------------|--------------------------------------------|---------------|
| `KNOWLEDGE_GALAXY_URL`     | URL for the Knowledge Galaxy service       |               |
| `KNOWLEDGE_GALAXY_ENABLED` | Enable Knowledge Galaxy for the KDL server | `false`       |

#### MinIO

| Environment variable     | Description                       | Default value |
|--------------------------|-----------------------------------|---------------|
| `MINIO_ACCESS_KEY`       | Access key for the Minio service  |               |
| `MINIO_ENDPOINT`         | URL for the Minio service         |               |
| `MINIO_SECRET_KEY`       | Secret key for the Minio service  |               |
| `MINIO_CONSOLE_ENDPOINT` | URL for the MinIO Console service |               |

#### Labels

| Environment variable          | Description                                                                  | Default value |
|-------------------------------|------------------------------------------------------------------------------|---------------|
| `LABELS_COMMON_APP_RELEASE`   | Release version for the common app labels and Service account creation       |               |
| `LABELS_COMMON_CHART_RELEASE` | Chart release version for the common app labels and Service account creation |               |

## Local deployment

In order to develop in a local environment there are several things to consider:

1. You need `kdl-server` up and running
2. Port-forward the MongoDB inside KDL: `kubectl -n kdl port-forward svc/mongodb 27017:27017`
3. Port-forward the MinIO inside KDL: `kubectl -n kdl port-forward svc/minio 9000:9000`
4. Load the environment variables: `source app/api/.env.dev`
5. Run `go run http/main.go` (or launch it from your preferred IDE)
6. You can now access the graphQL playground at <http://localhost:3000/api/playground>

### Additional scripts

Asides from starting KDL server, there are some additional go scripts that can
be used from inside the kdl-server pod:

#### Sync MinIO data

This script syncs data from the KDL server database to the MinIO instance.

Logic inside the script is:

* find all users, and for each user:
  * create a user in MinIO
  * update MinIO Credentials for the user in database

* find all projects, and for each project:
  * create a policy in MinIO for the project
  * create a user for the project and assign to the project's policy
  * update MinIO Credentials for the project in database
  * for each project's member:
    * join the user to the project in MinIO

To run the script execute:

```bash
/app/scripts/sync-minio-data
```

## Development

### GraphQL

The GraphQL schema is defined in the `../graphql/schema.graphqls` file. The
schema is used to generate the Go code for the GraphQL server. To generate the
code execute:

```console
go generate ./...
```

Configuration for the code generation is defined in the `gqlgen.yml` It is well
documented and can be customized to fit the needs of the project.

### Running tests

To create new tests install [GoMock](https://github.com/golang/mock). Mocks used on tests are generated with **mockgen**, when you need a new mock, add the following:

```go
//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}
```

To generate the mocks execute:

```console
go generate ./...
```

All tests:

```console
go test ./... --tags=integration,unit -v -cover
```

Run only unit tests

```console
go test ./... -tags=unit -v -cover
```

Run only integration tests

```console
go test ./... -tags=integration -v -cover
```

### Linters

`golangci-lint` is a fast Go linters runner. It runs linters in parallel, uses caching, supports yaml config, has integrations with all major IDE and has dozens of linters included.

As you can see in the `.github/.golangci.yml` config file of this repo, we enable more linters than the default and have more strict settings.

To run `golangci-lint` in the repository execute:

```console
make tidy
```

To run `golangci-lint` in the `app/api` folder execute:

```console
golangci-lint run --config ../../.github/.golangci.yml --build-tags=integration,unit
```

## References

* Structure based on [Clean Architecture](https://eltonminetto.dev/en/post/2020-07-06-clean-architecture-2years-later/)
