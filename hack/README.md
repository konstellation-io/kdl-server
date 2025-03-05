# Development

## Requirements

In order to start development on this project you will need these tools:

- **[gettext](https://www.gnu.org/software/gettext/)**: OS package to fill templates during deployment
- **[helm](https://helm.sh/)**: K8s package manager. Make sure you have v3+
- **[helmfile](https://helmfile.readthedocs.io/en/latest/#installation)**: Declarative spec for deploying helm charts
- **[kubectl](https://github.com/kubernetes/kubectl)**: Kubernetes' command line tool for communicating with a Kubernetes cluster's control plane, using the Kubernetes API.
- **[minikube](https://minikube.sigs.k8s.io/docs/start/)**: Local version of Kubernetes to deploy KAI
- **[pre-commit](https://pre-commit.com/)**: Pre-commit hooks execution tool ensures the best practices are followed before commiting any change
- **[yq](https://github.com/mikefarah/yq)**: YAML processor. Make sure you have v4+

## Pre-commit hooks setup

From the repository root execute the following commands:

```bash
pre-commit install
pre-commit install-hooks
pre-commit install --hook-type commit-msg
```

**Note**: _Contributing commits that had not passed the required hooks will be rejected._

## Local Environment

### Requirements

- `GITLAB_TOKEN` variable exported into your shell. See [Personal access
  tokens](https://docs.gitlab.com/security/tokens/#personal-access-tokens).
- [Minikube](https://minikube.sigs.k8s.io/docs/start/) >= 1.34
- [Docker](https://docs.docker.com/get-docker/)

  - [Linux](https://docs.docker.com/desktop/setup/install/linux/) >= 26.1
  - [Mac](https://docs.docker.com/desktop/setup/install/mac-install/)

  > **NOTE**: _You can use a different driver updating `.kdlctl.conf`; Check [this](https://minikube.sigs.k8s.io/docs/drivers/) for a complete list of drivers for Minikube_

## Basic usage

This repo contains a tool called `./kdlctl.sh` to handle common actions you need during development.

All the configuration needed to run KDL locally can be found in `.kdlctl.conf` file. Usually you'd be ok with the default values. Check minikube parameters if you need to tweak the resources assigned to the VM (only in Mac).

Run help to get info for each command:

```console
./kdlctl.sh --help

  kdlctl.sh -- a tool to manage KDL environment during development.

  syntax: kdlctl.sh <command> [options]

    commands:
      dev     creates a complete local environment.
      start   starts minikube.
      stop    stops minikube.
      build   calls docker to build all images and push them to minikube registry.
      deploy  calls helm to create install/upgrade a kdl release on minikube.
      restart restarts kdl pods or minikube useful after build command.

    global options:
      h     prints this help.
      q     silent mode.
```

## IPV6

As chrome is having some issues with IPV6 and docker (<https://bugs.chromium.org/p/chromium/issues/detail?id=974711>)
before you start minikube you need to disable IPV6 in your local machine, so when minikube is started it is configured
without IPV6 capabilities.

To disable IPV6:

```console
sysctl -w net.ipv6.conf.all.disable_ipv6=1
sysctl -w net.ipv6.conf.default.disable_ipv6=1
```

## Install local environment

To install KDL in your local environment:

```console
./kdlctl.sh dev
```

It will install everything in the namespace specified in your development `.kdlconf` file.

## Login to local environment

In order to access the admin app, the login process can be done automatically using this script:

```console
./kdlctl.sh login
```

You will see an output like this:

```console
Login link  : https://kdlapp.kdl.192.168.64.2.nip.io
👤 User     : kdladmin
🔑 Password : a123456
```

You can find the admin credentials `KEYCLOAK_ADMIN_USER` and `KEYCLOAK_ADMIN_PASSWORD` in the `.kdlctl.conf` file.

## Uninstall local environment

If you want to delete all resources generated into your minikube run the following command:

```console
./kdlctl.sh uninstall
```
