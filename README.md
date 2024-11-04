# kdl-server

|  Component  | Coverage  |  Bugs  |  Maintainability Rating  |  Go report  |
| :---------: | :-----:   |  :---: |  :--------------------:  |  :---: |
|  App API  | [![coverage][app-api-coverage]][app-api-coverage-link] | [![bugs][app-api-bugs]][app-api-bugs-link] | [![mr][app-api-mr]][app-api-mr-link] | [![go-report][report-badge]][report-link] |
|  App UI  | [![coverage][app-ui-coverage]][app-ui-coverage-link] | [![bugs][app-ui-bugs]][app-ui-bugs-link] | [![mr][app-ui-mr]][app-ui-mr-link] | - |

[report-badge]: https://goreportcard.com/badge/github.com/konstellation-io/kdl-server/app/api
[report-link]: https://goreportcard.com/report/github.com/konstellation-io/kdl-server/app/api

Konstellation AI Lab, formerly known as `kdl-server`, is the training server of Konstellation AI. It's the on-premises component of the solution, currently deployed in our Dell environment. As a Machine Learning training server, it's where the training of the models occurs, which will be used later by the inference server, Konstellation AI Server.

The main goal of KAI Lab is to provide a user-friendly environment for Data Scientists where they can carry out their experiments. At the same time, it integrates a powerful solution for project management, user environments with GPU capabilities, and job management.

## Components

* `kai-lab-api`: main component of the application, providing API access for other components and managing interactions with `MongoDB`.
* `kai-lab-ui`: web application offering the interface for data scientists.
* `repo-cloner`: in-house solution that clones all accessible repositories into the user's user-tools pod.
* `gitea`: git server mirroring project repositories.
* `postgresql`: database storing `gitea` data.
* `gitea-oauth2-proxy`: in-house solution exposing `gitea` login page to other pods.
* `drone-authorizer`: puppeteer-based tool authorizing `drone.io` with `gitea` via `oauth2`.
* `drone`: CI/CD tool building and deploying the application.
* `minio`: s3-compatible object storage, holding artifacts from training jobs; `MinIO` is installed as a pinned dependency, with only the console deployed through the chart.
* `backup`: Kubernetes `cronJob` that backs up `PostgreSQL` and `MongoDB` databases and stores Kubernetes `ETCD` manifests in `AWS S3`
* `cleaner`: currently unused, potentially slated for deprecation.
* `project-operator`: Kubernetes operator listening to `KAI Lab API`; on new project creation in the UI, it deploys a project-specific pod with `mlflow` and `file browser`.
* `user-tools-operator`: Kubernetes operator monitoring kai lab api; each time a user starts or changes runtime in the UI, this operator deploys a pod with vscode server and runtime containers based on selected image.

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
