# GitHub Actions - Workflows

These are the workflows defined in the repository:

* [Component](#component)
* [GitHub](#github)
* [Quality](#quality)
* [Releases](#releases)

## Component

* [component-build.yml](component-build.yml): automates the process of building and pushing Docker images for specific components to `Docker Hub` and `GitHub Container Registry (GHCR)` whenever a new tag is pushed to the repository. Handles metadata generation, release candidate tagging, and creates secure attestations for the published images.
* [component-linter.yml](component-linter.yml): performs linting checks on Dockerfile files for specific components whenever a `pull request` is opened or updated on the `main` branch. It leverages [`hadolint`](../.hadolint.yml) to identify issues in Dockerfile syntax and structure. Using a `matrix` strategy allows the workflow to lint multiple components in parallel, reducing the time needed for validation. The workflow only runs when Dockerfile changes are detected in a `pull request` targeting the `main` branch, ensuring that only relevant changes trigger linting.

## GitHub

* [dependabot.yml](../dependabot.yml): defines how Dependabot manages and updates dependencies for `GitHub Actions` and `Go` modules within the repository. The use of labels aids in organizing and tracking the updates, allowing different teams (`devops-team` and `develop-team`) to easily identify and address the relevant `pull requests`.
* [github-auto-assign.yml](github-auto-assign.yml): assignment of reviewers and assignees for pull requests when they are opened or marked as ready for review. Uses the `auto-assign-action` to dynamically assign reviewers based on configurations defined in separate YAML files for developers (`devs_auto_assign.yml`) and DevOps team members (`devops_auto_assign.yml`).

## Quality

* [quality-check-kdl-server-api.yml](quality-check-kdl-server-api.yml): checks on the API codebase of the KAI Lab project, including linting, testing, and code coverage for the `Go-based API`:
  * Static analysis through golangci-lint to catch code issues and enforce best practices.
  * Unit testing with coverage reports to ensure code quality and reliability.
  * Automated artifact generation for code coverage data, making it accessible for further analysis.
* [quality-check-kdl-server-ui.yml](quality-check-kdl-server-ui.yml): checks on the UI codebase of the KAI Lab project, including linting, unit tests, code coverage, and end-to-end (`e2e`) testing:
  * Static analysis through ESLint to catch code issues.
  * Unit testing with coverage reports to ensure code quality and maintainability.
  * End-to-end testing with Cypress to validate the UI’s functionality and user experience.
  * Automated artifact generation for code coverage data, allowing easy access and analysis of test results.

## Releases

* [releases-create.yml](releases-create.yml): creation of release tags for various components, either through a `manual trigger` or automatically upon changes in branches that follow the `release/*` pattern:
  * `Manual releases`: allows the user to select a specific component or all components for release, ensuring flexibility in managing releases.
  * `Automatic pre-releases`: detects changes in `release/*` branches and triggers releases only for the modified components, optimizing the release process by focusing on relevant changes.
