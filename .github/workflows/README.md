# Workflows

Workflow uses actions defined in [this repository](https://github.com/intelygenz/monorepo-tagger-action) and extra
info can be found in the repository [README.md](https://github.com/intelygenz/monorepo-tagger-action/blob/main/README.md). The templates are in the [github-workflows repository](https://github.com/konstellation-io/github-workflows).

These are the workflows defined in the repository:

1. Quality workflows per app component:
   1. API
   2. UI

## Quality workflows

Each component in the repo has a workflow that verifies QA.

- kdl-server-component-build.yml

Conditions:
- It's executed when a PR it's created and we have changes in the `app/` directory.

## Hadolint rules

Each component have its own linter for Dockerfiles. Take a look inside the [.hadolint.yml](.hadolint.yml) file. 

Conditions:
- It's executed when a PR it's created and we have changes in the specific component directory.

## Build Workflow RC

This workflow makes a tag per component. And build the container image in the tag generated.

Conditions:
- Only in `main` branch
- It depends of the path for the component updated.

## Build Workflow Fix

This workflow makes a fix tag per component. And build the container image in the tag generated.

Conditions:
- Only in `release*` branch
- It depends of the path for the component updated.

## Helm release RC

Generates a rc tag and a chart release. 

Conditions:
- When a workflow runs successfully.
- `main` branch.

## Helm release Fix

Generates a fix tag and a chart release. 

Conditions:
- When a workflow runs successfully.
- `release` branch.

## Release

Build a new release. Generates a new branch release and tag.

Conditions:
- Manual

**All the workflows update the tag images automatically.**