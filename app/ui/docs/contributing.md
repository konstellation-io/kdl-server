# Contributing
There are many ways to contribute to KDL application ui: logging bugs, reporting issues, submitting Pull Requests...

Make sure you hare checked the [issue list](https://github.com/konstellation-io/kdl-server/issues) before creating a new issue.

You can read about coding guidelines [here](./coding_guidelines.md).

## Prerequisites

There are two ways of working with KDL:
- **Option 1 (recommended):** start the local environment by using `yarn scripts`.
- **Option 2:** deploy the full environment locally using `kdlctl.sh` script.

> Before submitting a Pull Request, make sure to test the change is a deployed environment (the one created by using the `kdlctl.sh` script). There are things that may work with Option 1 and not with Option 2 and Option 2 is the closest one to a production environment.

### Option 1 prerequisites
- Make sure to have [yarn](https://yarnpkg.com/) installed on your machine.

### Option 2 prerequisites
The following software must be installed on your machine:
- [minikube](https://minikube.sigs.k8s.io/docs/start/)
- [envsubt](https://command-not-found.com/envsubst)
- [docker](https://www.docker.com/get-started)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [helm](https://helm.sh/docs/intro/install/)

## Running the application

### Option 1: using yarn
Two pieces are required:
- Mock server: this server will provide mock data to the application so we do not need the API server to be deployed.
  From the mock server root directory `app/ui/mock-server` install yarn dependencies by executing:
  ```
  yarn
  ```

  And then you can start the server by executing:
  ```
  yarn start
  ```
- Application: A simple React application.
  From the root directory `app/ui` install yarn dependencies by executing:
  ```
  yarn
  ```

  And then you can start the application by executing:
  ```
  yarn start
  ```

### Option 2: using kdlctl.sh
From the main kdl route (`/`) execute ```kdlctl.sh dev```.
> Note: add `--help` to get additional information about this script and how to use it.

When using this procedure, you will need to redeploy each time you make an update, and this takes time, so make sure to test or develop everything using Option 1.

## Troubleshooting

In case of issues, try deleting `node_modules` directory and reinstall yarn dependencies (`yarn`). You can also clear the cache by executing `yarn cache clean`.
