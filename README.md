# KDL Server

## App

|  Component  | Coverage  |  Bugs  |  Maintainability Rating  |  Go report  |
| :---------: | :-----:   |  :---: |  :--------------------:  |  :---: |
|  App API  | [![coverage][app-api-coverage]][app-api-coverage-link] | [![bugs][app-api-bugs]][app-api-bugs-link] | [![mr][app-api-mr]][app-api-mr-link] | [![go-report][report-badge]][report-link] |
|  App UI  | [![coverage][app-ui-coverage]][app-ui-coverage-link] | [![bugs][app-ui-bugs]][app-ui-bugs-link] | [![mr][app-ui-mr]][app-ui-mr-link] | - |

[report-badge]: https://goreportcard.com/badge/github.com/konstellation-io/kdl-server/app/api
[report-link]: https://goreportcard.com/report/github.com/konstellation-io/kdl-server/app/api

---

## Helm Chart

Refer to chart's [README](helm/kdl-server/README.md).

## Development

### Dependencies

#### Golang

This repository has been developed in Golang 1.23.2.

#### Microk8s

The local version of Kubernetes to deploy KDL. The version required is **1.26**.

Linux installation:

```
snap install --channel=1.26/stable microk8s --classic
```

In Mac, if the multipass vm doesn't exist the kdlctl.sh will create it automatically. You also can do it manually using:

```
source .kdlctl.conf
microk8s install --cpu ${MICROK8S_CPUS} --mem ${MICROK8S_MEMORY} --disk ${MICROK8S_DISK} --channel ${MICROK8S_CHANNEL}
```

#### Docker

Needed to build the KDL images. Installation:

<https://docs.docker.com/get-docker/>

#### Helm

K8s package manager. Make sure you have v3+. Installation:

<https://helm.sh/docs/intro/install/>

Please install all required helm plugins via

```
helmfile init
```

#### gettext

OS package to fill templates during deployment. Usually it is installed in Mac and Linux.

Ubuntu:

```
sudo apt-get install gettext
```

Mac:

```
brew install gettext
```

#### kubectl

The Kubernetes command-line tool is useful to run commands against Kubernetes clusters.

<https://kubernetes.io/docs/tasks/tools/>

#### jq (Mac only)

JSON processor to configure insecure-registries on Mac.

```
brew install jq
```

#### yq

YAML processor to configure KDL Remote developement.

```
brew install yq
```

## Local Environment

This repo contains a tool called `./kdlctl.sh` to handle common actions you need during development.

All the configuration needed to run KDL locally can be found in `.kdlctl.conf` file. Usually you'd be ok with the
default values. Check Microk8s parameters if you need to tweak the resources assigned to the VM (only in Mac).

Run help to get info for each command:

```
./kdlctl.sh --help

  kdlctl.sh -- a tool to manage KDL environment during development.

  syntax: kdlctl.sh <command> [options]

    commands:
      dev     creates a complete local environment.
      start   starts microk8s.
      stop    stops microk8s.
      build   calls docker to build all images and push them to microk8s registry.
      deploy  calls helm to create install/upgrade a kdl release on microk8s.
      restart restarts kdl pods or microk8s useful after build command.

    global options:
      h     prints this help.
      q     silent mode.
```

### IPV6

As chrome is having some issues with IPV6 and docker (<https://bugs.chromium.org/p/chromium/issues/detail?id=974711>)
before you start microk8s you need to disable IPV6 in your local machine, so when microk8s is started it is configured
without PIV6 capabilities.

To disable IPV6:

```
sysctl -w net.ipv6.conf.all.disable_ipv6=1
sysctl -w net.ipv6.conf.default.disable_ipv6=1
```

### Install local environment

To install KDL in your local environment:

```
./kdlctl.sh dev
```

It will install everything in the namespace specified in your development `.kdlconf` file.

### Login to local environment

In order to access the admin app, the login process can be done automatically using this script:

```
./kdlctl.sh login
```

You will see an output like this:

```
Login link  : https://kdlapp.kdl.192.168.64.2.nip.io
👤 User     : kdladmin
🔑 Password : a123456
```

You can find the admin credentials `GITEA_ADMIN_USER` and `GITEA_ADMIN_PASSWORD` in the `.kdlctl.conf` file.

### Install pre-commit

In this project, there is a pre-commit configuration to run some checks before
committing your code. It is not mandatory but it is recommended to have it in
your machine.

To install pre-commit hooks run the following command:

```bash
pip install pre-commit
pre-commit install
```

Please also install golangci-lint because it is executed by a pre-commit hook, e.g. via snap.
<https://golangci-lint.run/welcome/install/>

### Uninstall local environment

If you want to delete all resources generated into your microk8s run the following command:

```
./kdlctl.sh uninstall
```

## Versioning lifecycle

In the development lifecycle of KLI there are three main stages depend if we are going to add a new feature, release a
new version with some features or apply a fix to a current release.

### Alphas

In order to add new features just create a feature branch from master, and after the merger the Pull Request a workflow
will run the tests and if everything passes a new alpha tag will be created (like *v0.0chore/new-relese-notes-alpha.0*), and a new release
will be generated with this tag.

### Releases

After some alpha versions we can create what we call a release, and to do that we have to run manual the Release Action.
This workflow will create a new release branch and a new tag like *v0.0.0*. With this tag, a new release will be
generated.

### Fixes

If we find out a bug in a release, we can apply a bugfix just by creating a fixed branch from the specific release
branch, and creating a Pull Request to the same release branch. When the Pull Request is merged, after passing the
tests, a new fix tag will be created just by increasing the patch number of the version, and a new release will be build
and released.

## Knowledge Galaxy

This is an external tool for data scientist that can be integrated into KDL. You can read more info about this
tool [here](https://github.com/konstellation-io/knowledge-galaxy)

To enable the integration follow these steps:

- Enable Knowledge Galaxy in `helm/values.yaml` with a config like this:

```yaml
    knowledgeGalaxy:
      enabled: true
```

- Create a secret named `regcred` with the docker credential needed in order to download the private image:

```bash
kubectl create secret docker-registry regcred \
  --docker-username=$DOCKER_USERNAME \
  --docker-password=$DOCKER_AUTH_TOKEN \
   --dry-run=client -o yaml | kubectl -n kdl apply -f -
```

- Set the name imagePullSecret name in the `knowledgeGalaxy` config:

```yaml
    knowledgeGalaxy:
      enabled: true
      ...
      serviceaccount:
        ...
        imagePullSecrets:
          - regcred
```

### Local environment

To work with a local version of knowledge galaxy, edit your `.kdlctl.conf` file with the following information:

```bash
export KNOWLEDGE_GALAXY_LOCAL=true
export KNOWLEDGE_GALAXY_PATH=<path/to/local/knowledge-galaxy>
```

This will trigger a build whenever you use `kdlctl.sh` script.

## Capabilities

Capabilities feature allows to select the rules to be matched by the Kubernetes scheduler when deploying the userTools on a pod.

There are multiple scenarios for the capabilities based on the configuration stored on the MongoDB database:

1. There are no capabilities stored

- In the case where there are no capabilities stored on the database, the behavior would be the same as it is now, the Kubernetes scheduler will select the node where the userTools will be deployed.
- The UI won't show the capabilities selector

2. There is just one capability stored

- In case there is just one capability on the database, the stored capability will be selected by default, and the contained rules of the capability will determine the node where the userTools would be deployed.
- No selector will be shown on the UI.

3. There are two or more capabilities stored

- When there are two or more capabilities stored, the capabilities will be sorted by the `default` field, and the first capability from the list will be selected as the default capability.
- The UI will show a selector with all the capabilities to allow the user to choose between them.

The capabilities object contains three different ways of configuring the rules for deploying the userTools, allowing to do multiple combinations of different rule sets.

1. NodeSelectors

- A list of key-pair objects like in the example below:

    ```json
    {
      "_id": "test_id",
      "name": "test",
      "node_selectors": {
        "selector1": "value1",
        "selector2": "value2"
      },
      "tolerations": [],
      "affinities": {}
    }
    ```

2. Tolerations

- Unlike NodeSelectors, tolerations allow adding more complex rules.
- It consists of a list of `key`<`operator`>`value`:`effect` rule set like in the example below:

    ```json
    {
      "_id": "test_id",
      "name": "test",
      "node_selectors": {},
      "tolerations": [
        {
          "key": "key1",
          "operator": "Equal",
          "value": "value1",
          "effect": "NoExecute",
          "tolerationSeconds": 120
        }
      ],
      "affinities": {}
    }
    ```

3. Affinities

- Still in development...

    ```json
    {
      "_id": "test_id",
      "name": "test",
      "node_selectors": {},
      "tolerations": [],
      "affinities": {}
    }
    ```

### Adding capabilites to the MongoDB

To add capabilites to the mongodb, you should follow the next steps:

- Add port-forwardding from the mongodb pod

  ```bash
  kubectl port-forward mongo-.... 27017:27017
  ```

- Connect to the mongodb instance

  ```bash
  mongosh --port 27017 --username <username> --authenticationDatabase admin --password <password>
  ```

- Use the `KDL` database, and the `capabilities` collection

  ```bash
  use KDL
  ```

- Add the needed capabilites

  ```bash
  db.capabilities.insertMany([
    {
      "_id": "test_id1",
      "name": "test 1",
      "node_selectors": {
        "selector1": "value1",
        "selector2": "value2"
      },
      "tolerations": [],
      "affinities": {}
    },
    {
      "_id": "test_id2",
      "name": "test 2",
      "node_selectors": {},
      "tolerations": [
        {
          "key": "key1",
          "operator": "Equal",
          "value": "value1",
          "effect": "NoExecute",
          "tolerationSeconds": 120
        }
      ],
      "affinities": {}
    }
  ])
  ```
