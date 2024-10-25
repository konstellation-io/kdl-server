# KDL Server

## Builds

|  Component  | Coverage  |  Bugs  |  Maintainability Rating  |  Go report  |
| :---------: | :-----:   |  :---: |  :--------------------:  |  :---: |
|  App API  | [![coverage][app-api-coverage]][app-api-coverage-link] | [![bugs][app-api-bugs]][app-api-bugs-link] | [![mr][app-api-mr]][app-api-mr-link] | [![go-report][report-badge]][report-link] |
|  App UI  | [![coverage][app-ui-coverage]][app-ui-coverage-link] | [![bugs][app-ui-bugs]][app-ui-bugs-link] | [![mr][app-ui-mr]][app-ui-mr-link] | - |

[report-badge]: https://goreportcard.com/badge/github.com/konstellation-io/kdl-server/app/api
[report-link]: https://goreportcard.com/report/github.com/konstellation-io/kdl-server/app/api

## Development

* **golang**: `1.23.2`
* **microk8s**: `1.26`

  ```console
  # ubuntu install
  snap install --channel=1.26/stable microk8s --classic

  # deploy
  cd hack/
  source .kdlctl.conf
  microk8s install --cpu ${MICROK8S_CPUS} --mem ${MICROK8S_MEMORY} --disk ${MICROK8S_DISK} --channel ${MICROK8S_CHANNEL}
  ```

* **docker**: `>= 25` [install](https://docs.docker.com/get-docker/)
* **helm**: `>= v3.14` [install](https://helm.sh/docs/intro/install/)
* **helmfile**: `>= v0.168.0` [install](https://helmfile.readthedocs.io/en/latest/#installation)
* **gettext**: OS package to fill templates during deployment

  ```console
  # ubuntu
  sudo apt-get install gettext

  # macosx
  brew install gettext
  ```

* **kubectl**: `>= v1.25` [install](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
* **jq**: JSON processor to configure insecure-registries.

  ```console
  # macosx
  brew install jq
  ```

* **yq**: YAML processor to configure KDL Remote developement.

  ```console
  # macosx
  brew install yq
  ```

## GitFlow

We use the GitFlow branching model. Read more about it [here](docs/gitflow.md).

## Documentation

Refer to the [docs](docs) folder for more information:

* [capabilities](docs/capabilities.md)
* [environments](docs/environments.md)
* [knowledge-galaxy](docs/knowledge-galaxy.md)
* [kdlctl](hack/README.md): KDL server on local

## Helm Chart

Refer to the [kdl-server](https://github.com/konstellation-io/helm-charts/tree/main/charts/kdl-server) Helm chart for more information.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.
