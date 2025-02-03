# Local Environment

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

```text
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
