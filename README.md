# kdl-server

Konstellation AI Lab, formerly known as `kdl-server`, is the training server of Konstellation AI.

The main goal of KAI Lab is to provide a user-friendly environment for Data Scientists where they can carry out their experiments. At the same time, it integrates a powerful solution for project management, user environments with GPU capabilities and job management.

## Builds

| Component   | Bugs  | Coverage  | Maintainability Rating | Go report | Security |
| ----------- | ----- | --------- | ---------------------- | --------- | -------- |
| app-api     | [![api-report-bugs-badge]][api-report-bugs-link] | [![api-report-coverage-badge]][api-report-coverage-link] | [![api-report-maintain-badge]][api-report-maintain-link] | [![go-report][api-report-badge]][api-report-link] | [![api-report-security-badge]][api-report-security-link] |
| app-ui      | [![ui-report-bugs-badge]][ui-report-bugs-link] | [![ui-report-coverage-badge]][ui-report-coverage-link] | [![ui-report-maintain-badge]][ui-report-maintain-link] | - | [![ui-report-security-badge]][ui-report-security-link] |
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
* `project-operator`: Kubernetes operator listening to `KAI Lab API`, on new project creation in the UI, it deploys a project-specific pod with `mlflow` and `filebrowser`.
* `repo-cloner`: in-house solution that clones all accessible repositories into the user's `user-tools` pod.
* `user-tools-operator`: Kubernetes operator monitoring `KAI Lab API`, each time a user starts or changes runtime in the UI, this operator deploys a pod with a `runtime` containers based on selected image.

## Compatibility matrix

### app: 1.39.0

| Driver ↓ / Kubernetes → | 1.24 | 1.25 | 1.26 | 1.27 | 1.28 | 1.29 | 1.30 | 1.31 |
|:-----------------------:|:----:|:----:|:----:|:----:|:----:|:----:|:----:|:----:|
| 0.31.2                  | ✅   | ✅   | ✅   | ✅   | ✅   | ✅   | ✅   | ✅   |

| Driver ↓ / MongoDB → | 3.6 | 4.0 | 4.2 | 4.4 | 5.0 | 6.0 | 6.1 | 7.0 | 8.0 |
|:--------------------:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 1.17.1               | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | 🟠  |

| Driver ↓ / MinIO → | RELEASE.2021 | RELEASE.2022 | RELEASE.2023 | RELEASE.2024 |
|:------------------:|:------------:|:------------:|:------------:|:------------:|
| 7.0.78             | ✅           | ✅           | ✅           | ✅           |

### repo-cloner: 0.19.0

| Driver ↓ / MongoDB → | 3.6 | 4.0 | 4.2 | 4.4 | 5.0 | 6.0 | 6.1 | 7.0 | 8.0 |
|:--------------------:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 1.17.1               | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | ✅  | 🟠  |

### Legend

| Symbol | Description |
|:------:|-------------|
| ✅     | Perfect match: all features are supported. Client and server versions have exactly the same features/APIs. |
| 🟠     | Forward compatibility: the client will work with the server, but not all new server features are supported. The server has features that the client library cannot use. |
| ❌     | Backward compatibility/Not applicable: the client has features that may not be present in the server. Common features will work, but some client APIs might not be available in the server. |
| -      | Not tested: this combination has not been verified or is not applicable. |

### Notes

* For optimal compatibility, use matching client and server versions (✅)
* Common APIs between client and server versions will generally work even when marked with 🟠

### References

* [MongoDB driver matrix](https://www.mongodb.com/docs/drivers/go/current/compatibility/#std-label-golang-compatibility)
* [Kubernetes client matrix](https://github.com/kubernetes/client-go#compatibility-client-go---kubernetes-clusters)

## Development

Install our [tools](docs/tools.md) and follow the [kdlctl](hack/README.md) guide to deploy your local environment.

## GitFlow

We use the GitFlow branching model. Read more about it [here](docs/gitflow.md).

## Documentation

Refer to the [docs](docs) folder for more information:

* [capabilities](docs/capabilities.md): how-to install KDL capabilities
* [gke-integration](https://github.com/konstellation-io/konstellation-infrastructure/blob/main/docs/README_KDL_INT.md): GKE integration with develop tag images and CI/CD per each component
* [helm-value-precedence](docs/helm-value-precedence.md): Helm value precedence
* [kdl-server-operator](docs/kdl-server-operators.md): KDL Server Operator workflow
* [kdlctl](hack/README.md): deploy your KDL server on local
* [knowledge-galaxy](docs/knowledge-galaxy.md): KDL knowledge graph
* [runtimes](docs/runtimes.md): how-to install KDL runtimes
* [tools](docs/tools.md): tools used in the development process

## Helm Chart

Refer to the [kdl-server](https://github.com/konstellation-io/helm-charts/tree/main/charts/kdl-server) Helm chart for more information.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
