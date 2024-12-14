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

#### KDL server

| Environment variable           | Description                                 | Default value  |
|--------------------------------|---------------------------------------------|----------------|
| `BASE_DOMAIN_NAME`             | Base domain name for the KDL server         | `kdl.local`    |
| `KDL_SERVER_MONGODB_NAME`      | MongoDB Database name for the KDL server    |                |
| `KDL_SERVER_MONGODB_URI`       | MongoDB URI for the KDL server              |                |
| `KDL_SERVER_PORT`              | Port for the KDL API                        | `8080`         |
| `KDL_SERVER_STATIC_FILES_PATH` | Path for the static files of the KDL server |                |
| `POD_NAMESPACE`                | Namespace for the KDL server                |                |
| `SHARED_VOLUME`                | Shared volume for the KDL server            |                |
| `TLS_ENABLED`                  | Enable TLS for the KDL server               | `true`         |

#### KnowledgeGalaxy

| Environment variable       | Description                                | Default value                                     |
|----------------------------|--------------------------------------------|---------------------------------------------------|
| `KNOWLEDGE_GALAXY_URL`     | URL for the Knowledge Galaxy service       | `http://kdlapp.kdl.local/kg/projects/PROJECT_ID/` |
| `KNOWLEDGE_GALAXY_ENABLED` | Enable Knowledge Galaxy for the KDL server | `false`                                           |

#### MinIO

| Environment variable | Description                            | Default value       |
|----------------------|----------------------------------------|---------------------|
| `MINIO_ACCESS_KEY`   | Access key for the Minio service       |                     |
| `MINIO_ENDPOINT`     | URL for the Minio service              | `http://minio:9000` |
| `MINIO_SECRET_KEY`   | Secret key for the Minio service       |                     |

### Filebrowser

| Environment variable                 | Description                                        | Default value                                     |
|--------------------------------------|----------------------------------------------------|---------------------------------------------------|
| `PROJECT_FILEBROWSER_AFFINITY`       | Encoded affinity for the File Browser service      | `{}`                                              |
| `PROJECT_FILEBROWSER_IMG_PULLPOLICY` | Pull policy for the File Browser image             | `IfNotPresent`                                    |
| `PROJECT_FILEBROWSER_IMG_REPO`       | Repository for the File Browser image              | `filebrowser/filebrowser`                         |
| `PROJECT_FILEBROWSER_IMG_TAG`        | Tag for the File Browser image                     | `v2`                                              |
| `PROJECT_FILEBROWSER_NODESELECTOR`   | Encoded node selector for the File Browser service | `{}`                                              |
| `PROJECT_FILEBROWSER_TOLERATIONS`    | Encoded tolerations for the File Browser service   | `[]`                                              |
| `PROJECT_FILEBROWSER_URL`            | URL for the File Browser service                   | `http://kdlapp.kdl.local/filebrowser/PROJECT_ID/` |

### MLflow

| Environment variable                         | Description                                        | Default value                                |
|----------------------------------------------|----------------------------------------------------|----------------------------------------------|
| `PROJECT_MLFLOW_AFFINITY`                    | Encoded affinity for the MLflow service            | `{}`                                         |
| `PROJECT_MLFLOW_ENCODED_INGRESS_ANNOTATIONS` | Encoded ingress annotations for the MLflow service | `{}`                                         |
| `PROJECT_MLFLOW_IMG_PULLPOLICY`              | Pull policy for the MLflow image                   | `IfNotPresent`                               |
| `PROJECT_MLFLOW_IMG_REPO`                    | Repository for the MLflow image                    | `konstellation/kdl-mlflow`                   |
| `PROJECT_MLFLOW_IMG_TAG`                     | Tag for the MLflow image                           | `v0.13.5`                                    |
| `PROJECT_MLFLOW_INGRESS_CLASS_NAME`          | Ingress class name for the MLflow service          | `nginx`                                      |
| `PROJECT_MLFLOW_INGRESS_TLS_SECRET_NAME`     | TLS secret name for the MLflow service             |                                              |
| `PROJECT_MLFLOW_NODESELECTOR`                | Encoded node selector for the MLflow service       | `{}`                                         |
| `PROJECT_MLFLOW_STORAGE_CLASS_NAME`          | Storage class name for the MLflow service          | `standard`                                   |
| `PROJECT_MLFLOW_STORAGE_SIZE`                | Storage size for the MLflow service                | `1Gi`                                        |
| `PROJECT_MLFLOW_TOLERATIONS`                 | Encoded tolerations for the MLflow service         | `[]`                                         |
| `PROJECT_MLFLOW_URL`                         | URL for the MLflow service                         | `http://kdlapp.kdl.local/mlflow/PROJECT_ID/` |

### oauth2-proxy

| Environment variable          | Description                            | Default value                       |
|-------------------------------|----------------------------------------|-------------------------------------|
| `OAUTH2_PROXY_IMG_PULLPOLICY` | Pull policy for the oauth2-proxy image | `IfNotPresent`                      |
| `OAUTH2_PROXY_IMG_REPO`       | Repository for the oauth2-proxy image  | `quay.io/oauth2-proxy/oauth2-proxy` |
| `OAUTH2_PROXY_IMG_TAG`        | Tag for the oauth2-proxy image         | `v7.0.1-amd64`                      |

### VScode

| Environment variable    | Description                      | Default value              |
|-------------------------|----------------------------------|----------------------------|
| `VSCODE_IMG_PULLPOLICY` | Pull policy for the VScode image | `IfNotPresent`             |
| `VSCODE_IMG_REPO`       | Repository for the VScode image  | `konstellation/kdl-vscode` |
| `VSCODE_IMG_TAG`        | Tag for the VScode image         | `v0.15.0`                  |

### repo-cloner

| Environment variable         | Description                           | Default value                   |
|------------------------------|---------------------------------------|---------------------------------|
| `REPO_CLONER_IMG_PULLPOLICY` | Pull policy for the repo-cloner image | `IfNotPresent`                  |
| `REPO_CLONER_IMG_REPO`       | Repository for the repo-cloner image  | `konstellation/kdl-repo-cloner` |
| `REPO_CLONER_IMG_TAG`        | Tag for the repo-cloner image         | `0.18.0`                        |

### user-tools-operator

| Environment variable                        | Description                                            | Default value                                                          |
|---------------------------------------------|--------------------------------------------------------|------------------------------------------------------------------------|
| `USER_TOOLS_ENCODED_INGRESS_ANNOTATIONS`    | Encoded ingress annotations for the User Tools service | `{}`                                                                   |
| `USER_TOOLS_INGRESS_CLASS_NAME`             | Ingress class name for the User Tools service          | `nginx`                                                                |
| `USER_TOOLS_KUBECONFIG_DOWNLOAD_ENABLED`    | Enable kubeconfig download for the User Tools service  | `false`                                                                |
| `USER_TOOLS_KUBECONFIG_EXTERNAL_SERVER_URL` | URL for the kubeconfig download service                |                                                                        |
| `USER_TOOLS_OAUTH2_PROXY_IMG_PULLPOLICY`    | Pull policy for the VScode image                       | `IfNotPresent`                                                         |
| `USER_TOOLS_OAUTH2_PROXY_IMG_REPO`          | Repository for the oauth2-proxy image                  | `quay.io/oauth2-proxy/oauth2-proxy`                                    |
| `USER_TOOLS_OAUTH2_PROXY_IMG_TAG`           | Tag for the oauth2-proxy image                         | `v7.0.1-amd64`                                                         |
| `USER_TOOLS_STORAGE_CLASSNAME`              | Storage class name for the User Tools service          | `standard`                                                             |
| `USER_TOOLS_STORAGE_SIZE`                   | Storage size for the User Tools service                | `10Gi`                                                                 |
| `USER_TOOLS_TLS_SECRET_NAME`                | TLS secret name for the User Tools service             |                                                                        |
| `USER_TOOLS_VSCODE_RUNTIME_IMG_PULLPOLICY`  | Pull policy for the VScode Runtime image               | `IfNotPresent`                                                         |
| `USER_TOOLS_VSCODE_RUNTIME_IMG_REPO`        | Repository for the VScode Runtime image                | `konstellation/kdl-py`                                                 |
| `USER_TOOLS_VSCODE_RUNTIME_IMG_TAG`         | Tag for the VScode Runtime image                       | `3.9`                                                                  |
| `USER_TOOLS_VSCODE_URL`                     | URL for the VScode service                             | `http://USERNAME-code.kdl.local/?folder=/home/coder/repos/REPO_FOLDER` |

### Labels

| Environment variable          | Default value | Description                                                                  |
|-------------------------------|---------------|------------------------------------------------------------------------------|
| `LABELS_COMMON_APP_RELEASE`   | `1.38.0`      | Release version for the common app labels and Service account creation       |
| `LABELS_COMMON_CHART_RELEASE` |               | Chart release version for the common app labels and Service account creation |

## Local deployment

In order to develop in a local environment there are several things to consider:

1. You need `kdl-server` up and running
2. Port-forward the MongoDB inside KDL: `kubectl -n kdl port-forward svc/mongodb 27017:27017`
3. Port-forward the MinIO inside KDL: `kubectl -n kdl port-forward svc/minio 9000:9000`
4. Load the environment variables: `source app/api/.env.dev`
5. Run `go run http/main.go` (or launch it from your preferred IDE)
6. You can now access the graphQL playground at <http://localhost:3000/api/playground>

## Development

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
