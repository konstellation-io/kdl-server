# Workflows

Workflow uses actions defined in [this repository](https://github.com/intelygenz/action-product-version-tags) and extra
info can be found in the repository README.md

These are the workflows defined in the repository, in order of execution:

1. Quality workflows per each component
   1. API
   2. UI
   3. MLFLow
   4. Project Operator
2. Pre Release
3. Release
4. Build Release

## Quality workflows

Each component in the repo has a workflow that verifies QA.

- kdl-server-app-api-quality.yml
- kdl-server-app-ui-quality.yml
- kdl-server-mlflow-quality.yml
- kdl-server-project-operator-quality.yml

Conditions:
- Ignore tags starting with `v*`
- Ignore branches starting with `v*`
- Each workflow is triggered only if the component is changed

## Pre Release Workflow

This workflow makes an alpha tag, calculating the major and minor automatically from the tag list present in the repository.

Conditions:
- Only in `main` branch
- Only if a quality workflow was triggered

## Release

Generates a new release tag and branch. The tag is calculated taking in account the last pre-release tag.

Conditions:
- Manual run

## Build Release

Builds a new release for the last created tag. This workflow build each component and makes a new release for each one
with the same version tag. It also does a release for the KDL Helm Chart with the new artifacts versions.

Conditions:
- On tag creation with `v*.*.*`