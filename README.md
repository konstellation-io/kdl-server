# kdl-server

Konstellation AI Lab, formerly known as `kdl-server`, is the training server of Konstellation AI.

The main goal of KAI Lab is to provide a user-friendly environment for Data Scientists where they can carry out their experiments. At the same time, it integrates a powerful solution for project management, user environments with GPU capabilities and job management.

## Builds

| Component   | Bugs  | Coverage  | Maintainability Rating | Go report | Security |
| ----------- | ----- | --------- | ---------------------- | --------- | -------- |
| app-api     | [![api-report-bugs-badge]][api-report-bugs-link] | [![api-report-coverage-badge]][api-report-coverage-link] | [![api-report-maintain-badge]][api-report-maintain-link] | [![go-report][api-report-badge]][api-report-link] | [![api-report-security-badge]][api-report-security-link] |
| app-ui      | [![ui-report-bugs-badge]][ui-report-bugs-link] | [![ui-report-coverage-badge]][ui-report-coverage-link] | [![ui-report-maintain-badge]][ui-report-maintain-link] | - | [![ui-report-security-badge]][ui-report-security-link] |
| cleaner     | [![cleaner-report-bugs-badge]][cleaner-report-bugs-link] | [![cleaner-report-coverage-badge]][cleaner-report-coverage-link] | [![cleaner-report-maintain-badge]][cleaner-report-maintain-link] | [![go-report][api-report-badge]][cleaner-report-link] | [![cleaner-report-security-badge]][cleaner-report-security-link] |
| repo-cloner | [![repo-cloner-report-bugs-badge]][repo-cloner-report-bugs-link] | [![repo-cloner-report-coverage-badge]][repo-cloner-report-coverage-link] | [![repo-cloner-report-maintain-badge]][repo-cloner-report-maintain-link] | [![go-report][repo-cloner-report-badge]][repo-cloner-report-link] | [![repo-cloner-report-security-badge]][repo-cloner-report-security-link] |

[api-report-bugs-badge]: https://sonarcloud.io/api/project_badges/measure?project=kdl-server_app-api&metric=bugs
[api-report-bugs-link]: https://sonarcloud.io/summary/new_code?id=kdl-server_app-api
[api-report-coverage-badge]: https://sonarcloud.io/api/project_badges/measure?project=kdl-server_app-api&metric=coverage
[api-report-coverage-link]: https://sonarcloud.io/summary/new_code?id=kdl-server_app-api
[api-report-maintain-badge]: https://sonarcloud.io/api/project_badges/measure?project=kdl-server_app-api&metric=sqale_rating
[api-report-maintain-link]: https://sonarcloud.io/summary/new_code?id=kdl-server_app-api
[api-report-security-badge]: https://sonarcloud.io/api/project_badges/measure?project=kdl-server_app-api&metric=security_rating
[api-report-security-link]: https://sonarcloud.io/summary/new_code?id=kdl-server_app-api
[api-report-badge]: https://goreportcard.com/badge/github.com/konstellation-io/kdl-server/app/api
[api-report-link]: https://goreportcard.com/report/github.com/konstellation-io/kdl-server/app/api
[ui-report-bugs-badge]: https://sonarcloud.io/api/project_badges/measure?project=kdl-server_app-ui&metric=bugs
[ui-report-bugs-link]: https://sonarcloud.io/summary/new_code?id=kdl-server_app-ui
[ui-report-coverage-badge]: https://sonarcloud.io/api/project_badges/measure?project=kdl-server_app-ui&metric=coverage
[ui-report-coverage-link]: https://sonarcloud.io/summary/new_code?id=kdl-server_app-ui
[ui-report-maintain-badge]: https://sonarcloud.io/api/project_badges/measure?project=kdl-server_app-ui&metric=sqale_rating
[ui-report-maintain-link]: https://sonarcloud.io/summary/new_code?id=kdl-server_app-ui
[ui-report-security-badge]: https://sonarcloud.io/api/project_badges/measure?project=kdl-server_app-ui&metric=security_rating
[ui-report-security-link]: https://sonarcloud.io/summary/new_code?id=kdl-server_app-ui
[cleaner-report-bugs-badge]: https://sonarcloud.io/api/project_badges/measure?project=kdl-server_cleaner&metric=bugs
[cleaner-report-bugs-link]: https://sonarcloud.io/summary/new_code?id=kdl-server_cleaner
[cleaner-report-coverage-badge]: https://sonarcloud.io/api/project_badges/measure?project=kdl-server_cleaner&metric=coverage
[cleaner-report-coverage-link]: https://sonarcloud.io/summary/new_code?id=kdl-server_cleaner
[cleaner-report-maintain-badge]: https://sonarcloud.io/api/project_badges/measure?project=kdl-server_cleaner&metric=sqale_rating
[cleaner-report-maintain-link]: https://sonarcloud.io/summary/new_code?id=kdl-server_cleaner
[cleaner-report-security-badge]: https://sonarcloud.io/api/project_badges/measure?project=kdl-server_cleaner&metric=security_rating
[cleaner-report-security-link]: https://sonarcloud.io/summary/new_code?id=kdl-server_cleaner
[cleaner-report-link]: https://goreportcard.com/report/github.com/konstellation-io/kdl-server/cleaner
[repo-cloner-report-bugs-badge]: https://sonarcloud.io/api/project_badges/measure?project=kdl-server_repo-cloner&metric=bugs
[repo-cloner-report-bugs-link]: https://sonarcloud.io/summary/new_code?id=kdl-server_repo-cloner
[repo-cloner-report-coverage-badge]: https://sonarcloud.io/api/project_badges/measure?project=kdl-server_repo-cloner&metric=coverage
[repo-cloner-report-coverage-link]: https://sonarcloud.io/summary/new_code?id=kdl-server_repo-cloner
[repo-cloner-report-maintain-badge]: https://sonarcloud.io/api/project_badges/measure?project=kdl-server_repo-cloner&metric=sqale_rating
[repo-cloner-report-maintain-link]: https://sonarcloud.io/summary/new_code?id=kdl-server_repo-cloner
[repo-cloner-report-security-badge]: https://sonarcloud.io/api/project_badges/measure?project=kdl-server_repo-cloner&metric=security_rating
[repo-cloner-report-security-link]: https://sonarcloud.io/summary/new_code?id=kdl-server_repo-cloner
[repo-cloner-report-badge]: https://goreportcard.com/badge/github.com/konstellation-io/kdl-server/repo-cloner
[repo-cloner-report-link]: https://goreportcard.com/report/github.com/konstellation-io/kdl-server/repo-cloner

## Components

* `app-api`: main component of the application, providing API access for other components and managing interactions with `MongoDB`.
* `app-ui`: web application offering the interface for data scientists.
* `cleaner`: currently unused, potentially slated for deprecation.
* `gitea-oauth2-proxy`: in-house solution exposing `gitea` login page to other pods.
* `gitea`: git server mirroring project repositories.
* `minio`: s3-compatible object storage, holding artifacts from training jobs; `MinIO` is installed as a pinned dependency, with only the console deployed through the chart.
* `postgresql`: database storing `gitea` data.
* `project-operator`: Kubernetes operator listening to `KAI Lab API`; on new project creation in the UI, it deploys a project-specific pod with `mlflow` and `file browser`.
* `repo-cloner`: in-house solution that clones all accessible repositories into the user's user-tools pod.
* `user-tools-operator`: Kubernetes operator monitoring kai lab api; each time a user starts or changes runtime in the UI, this operator deploys a pod with vscode server and runtime containers based on selected image.

## Matrix compatibility

> [!NOTE]
> If component isn't on the matrix, that means it component hasn't dependencies.

| Component     | Dependencies                 | Version   | Compatibility                 |
| ------------- | ---------------------------- | --------- | ----------------------------- |
| `app`         | code.gitea.io/sdk/gitea      | `v0.19.0` | -                             |
|               | github.com/minio/minio-go/v7 | `v7.0.78` | -                             |
|               | go.mongodb.org/mongo-driver  | `v1.17.1` | [MongoDB `>=3.6, =<7.X`]      |
|               | k8s.io/api                   | `v0.31.1` | [Kubernetes `>=1.24, =<1.30`] |
|               | k8s.io/apimachinery          | `v0.31.1` | [Kubernetes `>=1.24, =<1.30`] |
|               | k8s.io/client-go             | `v0.31.1` | [Kubernetes `>=1.24, =<1.30`] |
| `repo-cloner` | go.mongodb.org/mongo-driver  | `v1.17.1` | [MongoDB `>=3.6, =<7.X`]      |
| `gitea`       | k8s.io/api                   | `v0.31.1` | [Kubernetes `>=1.24, =<1.30`] |
|               | k8s.io/apimachinery          | `v0.31.1` | [Kubernetes `>=1.24, =<1.30`] |
|               | k8s.io/client-go             | `v0.31.1` | [Kubernetes `>=1.24, =<1.30`] |

[MongoDB `>=3.6, =<7.X`]: https://www.mongodb.com/docs/drivers/go/current/compatibility/#std-label-golang-compatibility
[Kubernetes `>=1.24, =<1.30`]: https://github.com/kubernetes/client-go#compatibility-client-go---kubernetes-clusters

## Development

Install our [tools](docs/tools.md) and follow the [kdlctl](hack/README.md) guide to deploy your local environment.

## GitFlow

We use the GitFlow branching model. Read more about it [here](docs/gitflow.md).

## Documentation

Refer to the [docs](docs) folder for more information:

* [capabilities](docs/capabilities.md): how-to install KDL's capabilities
* [gke-integration](docs/gke-integration.md): GKE integration with develop tag images and CI/CD per each component
* [kdlctl](hack/README.md): deploy your KDL server on local
* [knowledge-galaxy](docs/knowledge-galaxy.md): KDL's knowledge graph
* [runtimes](docs/runtimes.md): how-to install KDL's runtimes
* [tools](docs/tools.md): tools used in the development process

## Helm Chart

Refer to the [kdl-server](https://github.com/konstellation-io/helm-charts/tree/main/charts/kdl-server) Helm chart for more information.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
