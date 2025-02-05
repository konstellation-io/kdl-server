# Tools and requirements

Follow these steps to setup your development environment:

- **golang**: `1.23.2`
- **minikube**: `>= 1.34`

  ```console
  # ubuntu
  curl -LO https://github.com/kubernetes/minikube/releases/download/v1.35.0/minikube_1.35.0-0_amd64.deb
  sudo dpkg -i minikube_1.35.0-0_amd64.deb

  # macos
  brew install minikube

  # deploy
  cd hack/
  ./kdlctl.sh dev
  ./kdlctl.sh deploy
  ```

- **docker**: `>= 25` [install](https://docs.docker.com/get-docker/)
- **helm**: `>= v3.14` [install](https://helm.sh/docs/intro/install/)
- **helmfile**: `>= v0.168.0` [install](https://helmfile.readthedocs.io/en/latest/#installation)
- **gettext**: OS package to fill templates during deployment

  ```console
  # ubuntu
  sudo apt-get install gettext

  # macos
  brew install gettext
  ```

- **kubectl**: `>= v1.28` [install](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- **jq**: JSON processor to configure insecure-registries.

  ```console
  # macos
  brew install jq
  ```

- **yq**: YAML processor to configure KDL Remote developement.

  ```console
  # macos
  brew install yq
  ```

Continue reading the [Running your develop environment](../hack/README.md) guide.

## Local Development

In order to use go development tools in your local environment, you need to have
a `go.work` file in your root path in the supported go version of KDL (1.23.2).

How to generate a `go.work` file:

```console
go work init ./app/api ./repo-cloner
```
