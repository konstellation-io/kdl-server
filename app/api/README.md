# Admin-api

Structure based on: https://eltonminetto.dev/en/post/2020-07-06-clean-architecture-2years-later/

## Local development

In order to develop in a local environment there are several things to consider:

1. You need kdl up and running
2. Port-forward the mongodb inside kdl `kubectl -n kdl port-forward pods/kdl-mongo-0 27017:27017`
3. Port-forward the gitea inside kdl `kubectl -n kdl port-forward pods/gitea-0 3001:3000`
4. Port-forward the gitea inside kdl `kubectl -n kdl port-forward pods/[MINIO-POD-ID] 9001:9001`
5. Load the environment variables (they are located in `app/api/.env.dev`):
6. run `go run http/main.go` (or launch it from your preferred IDE)
7. You can now access the graphQL playground at `http://localhost:3000/api/playground`

## Testing

To create new tests install [GoMock](https://github.com/golang/mock). Mocks used on tests are generated with
**mockgen**, when you need a new mock, add the following:

```go
//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}
```

To generate the mocks execute:

```sh
$ go generate ./...
```

### Run tests

```sh
go test ./...
```

## Linters

`golangci-lint` is a fast Go linters runner. It runs linters in parallel, uses caching, supports yaml config, has
integrations with all major IDE and has dozens of linters included.

As you can see in the `.golangci.yml` config file of this repo, we enable more linters than the default and have more
strict settings.

To run `golangci-lint` execute:

```
golangci-lint run
```

## Environment variables

### KDL

| Environment variable         | Default value  | Description                                 |
| ---------------------------- | -------------- | ------------------------------------------- |
| KDL_ADMIN_EMAIL              | kdladmin       | Admin email for the KDL server              |
| KDL_ADMIN_PASSWORD           | 123456         | Admin password for the KDL server           |
| KDL_SERVER_PORT              | 8080           | Port for the KDL API                        |
| BASE_DOMAIN_NAME             | kdl.local      | Base domain name for the KDL server         |
| TLS_ENABLED                  | true           | Enable TLS for the KDL server               |
| SHARED_VOLUME                |                | Shared volume for the KDL server            |
| KDL_SERVER_STATIC_FILES_PATH |                | Path for the static files of the KDL server |
| KDL_SERVER_MONGODB_URI       |                | MongoDB URI for the KDL server              |
| KDL_SERVER_MONGODB_NAME      |                | MongoDB Database name for the KDL server    |
| POD_NAMESPACE                |                | Namespace for the KDL server                |

### GITEA

| Environment variable         | Default value          | Description                         |
| ---------------------------- | ---------------------- | ----------------------------------- |
| GITEA_ADMIN_USER             | kdladmin               | Admin user for the Gitea server     |
| GITEA_ADMIN_PASSWORD         | 123456                 | Admin password for the Gitea server |
| GITEA_URL                    | http://gitea.kdl.local | External URL for the Gitea server   |
| GITEA_INTERNAL_URL           | http://gitea:3000      | Internal URL for the Gitea server   |

### KNOWLEDGE GALAXY

| Environment variable     | Default value                                   | Description                                |
| ------------------------ | ----------------------------------------------- | ------------------------------------------ |
| KNOWLEDGE_GALAXY_URL     | http://kdlapp.kdl.local/kg/projects/PROJECT_ID/ | URL for the Knowledge Galaxy service       |
| KNOWLEDGE_GALAXY_ENABLED | false                                           | Enable Knowledge Galaxy for the KDL server |

### MINIO

| Environment variable     | Default value     | Description                            |
| ------------------------ | ----------------- | -------------------------------------- |
| MINIO_ENDPOINT           | http://minio:9000 | URL for the Minio service              |
| MINIO_ACCESS_KEY         |                   | Access key for the Minio service       |
| MINIO_SECRET_KEY         |                   | Secret key for the Minio service       |

### FILEBROWSER

| Environment variable               | Default value                                   | Description                                        |
| ---------------------------------- | ----------------------------------------------- | -------------------------------------------------- |
| PROJECT_FILEBROWSER_URL            | http://kdlapp.kdl.local/filebrowser/PROJECT_ID/ | URL for the File Browser service                   |
| PROJECT_FILEBROWSER_IMG_PULLPOLICY | IfNotPresent                                    | Pull policy for the File Browser image             |
| PROJECT_FILEBROWSER_IMG_REPO       | filebrowser/filebrowser                         | Repository for the File Browser image              |
| PROJECT_FILEBROWSER_IMG_TAG        | v2                                              | Tag for the File Browser image                     |
| PROJECT_FILEBROWSER_AFFINITY       | {}                                              | Encoded affinity for the File Browser service      |
| PROJECT_FILEBROWSER_NODESELECTOR   | {}                                              | Encoded node selector for the File Browser service |
| PROJECT_FILEBROWSER_TOLERATIONS    | []                                              | Encoded tolerations for the File Browser service   |

### MLFLOW

| Environment variable                       | Default value                              | Description                                        |
| ------------------------------------------ | ------------------------------------------ | -------------------------------------------------- |
| PROJECT_MLFLOW_URL                         | http://kdlapp.kdl.local/mlflow/PROJECT_ID/ | URL for the MLFlow service                         |
| PROJECT_MLFLOW_IMG_PULLPOLICY              | IfNotPresent                               | Pull policy for the MLFlow image                   |
| PROJECT_MLFLOW_IMG_REPO                    | konstellation/kdl-mlflow                   | Repository for the MLFlow image                    |
| PROJECT_MLFLOW_IMG_TAG                     | v0.13.5                                    | Tag for the MLFlow image                           |
| PROJECT_MLFLOW_STORAGE_CLASS_NAME          | standard                                   | Storage class name for the MLFlow service          |
| PROJECT_MLFLOW_STORAGE_SIZE                | 1Gi                                        | Storage size for the MLFlow service                |
| PROJECT_MLFLOW_INGRESS_CLASS_NAME          | nginx                                      | Ingress class name for the MLFlow service          |
| PROJECT_MLFLOW_ENCODED_INGRESS_ANNOTATIONS | {}                                         | Encoded ingress annotations for the MLFlow service |
| PROJECT_MLFLOW_INGRESS_TLS_SECRET_NAME     |                                              | TLS secret name for the MLFlow service             |
| PROJECT_MLFLOW_AFFINITY                    | {}                                         | Encoded affinity for the MLFlow service            |
| PROJECT_MLFLOW_NODESELECTOR                | {}                                         | Encoded node selector for the MLFlow service       |
| PROJECT_MLFLOW_TOLERATIONS                 | []                                         | Encoded tolerations for the MLFlow service         |

### OAUTH2 PROXY

| Environment variable        | Default value                     | Description                            |
| --------------------------- | --------------------------------- | -------------------------------------- |
| OAUTH2_PROXY_IMG_PULLPOLICY | IfNotPresent                      | Pull policy for the OAuth2 Proxy image |
| OAUTH2_PROXY_IMG_REPO       | quay.io/oauth2-proxy/oauth2-proxy | Repository for the OAuth2 Proxy image  |
| OAUTH2_PROXY_IMG_TAG        | v7.0.1-amd64                      | Tag for the OAuth2 Proxy image         |

### VSCODE

| Environment variable  | Default value            | Description                      |
| --------------------- | ------------------------ | -------------------------------- |
| VSCODE_IMG_PULLPOLICY | IfNotPresent             | Pull policy for the VSCode image |
| VSCODE_IMG_REPO       | konstellation/kdl-vscode | Repository for the VSCode image  |
| VSCODE_IMG_TAG        | v0.15.0                  | Tag for the VSCode image         |

### REPO CLONER

| Environment variable       | Default value                 | Description                           |
| -------------------------- | ----------------------------- | ------------------------------------- |
| REPO_CLONER_IMG_PULLPOLICY | IfNotPresent                  | Pull policy for the Repo Cloner image |
| REPO_CLONER_IMG_REPO       | konstellation/kdl-repo-cloner | Repository for the Repo Cloner image  |
| REPO_CLONER_IMG_TAG        | 0.18.0                        | Tag for the Repo Cloner image         |

### USER TOOLS

| Environment variable                         | Default value                                                        | Description                                            |
| -------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------ |
| USER_TOOLS_VSCODE_URL                        | http://USERNAME-code.kdl.local/?folder=/home/coder/repos/REPO_FOLDER | URL for the VSCode service                             |
| USER_TOOLS_OAUTH2_PROXY_IMG_PULLPOLICY       | IfNotPresent                                                         | Pull policy for the VSCode image                       |
| USER_TOOLS_OAUTH2_PROXY_IMG_REPO             | quay.io/oauth2-proxy/oauth2-proxy                                    | Repository for the OAuth2 Proxy image                  |
| USER_TOOLS_OAUTH2_PROXY_IMG_TAG              | v7.0.1-amd64                                                         | Tag for the OAuth2 Proxy image                         |
| USER_TOOLS_VSCODE_RUNTIME_IMG_PULLPOLICY     | IfNotPresent                                                         | Pull policy for the VSCode Runtime image               |
| USER_TOOLS_VSCODE_RUNTIME_IMG_REPO           | konstellation/kdl-py                                                 | Repository for the VSCode Runtime image                |
| USER_TOOLS_VSCODE_RUNTIME_IMG_TAG            | 3.9                                                                  | Tag for the VSCode Runtime image                       |
| USER_TOOLS_KUBECONFIG_DOWNLOAD_ENABLED       | false                                                                | Enable kubeconfig download for the User Tools service  |
| USER_TOOLS_KUBECONFIG_EXTERNAL_SERVER_URL    |                                                                        | URL for the kubeconfig download service                |
| USER_TOOLS_STORAGE_SIZE                      | 10Gi                                                                 | Storage size for the User Tools service                |
| USER_TOOLS_STORAGE_CLASSNAME                 | standard                                                             | Storage class name for the User Tools service          |
| USER_TOOLS_INGRESS_CLASS_NAME                | nginx                                                                | Ingress class name for the User Tools service          |
| USER_TOOLS_ENCODED_INGRESS_ANNOTATIONS       | {}                                                                   | Encoded ingress annotations for the User Tools service |
| USER_TOOLS_TLS_SECRET_NAME                   |                                                                        | TLS secret name for the User Tools service             |

### Labels

| Environment variable        | Default value | Description                                                                  |
| --------------------------- | ------------- | ---------------------------------------------------------------------------- |
| LABELS_COMMON_APP_RELEASE   | 1.38.0        | Release version for the common app labels and Service account creation       |
| LABELS_COMMON_CHART_RELEASE |               | Chart release version for the common app labels and Service account creation |
