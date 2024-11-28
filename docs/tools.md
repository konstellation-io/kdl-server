# Tools and requirements

Follow these steps to setup your development environment:

* **golang**: `1.23.2`
* **microk8s**: `1.26`

  ```console
  # ubuntu install
  snap install --channel=1.26/stable microk8s --classic

  # deploy
  cd hack/
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

Continue reading the [Running your develop environment](../hack/README.md) guide.
