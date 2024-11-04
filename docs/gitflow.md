# GitFlow: publishing pre-releases and stable releases

Manages pre-releases and stable releases using `semantic-release-monorepo` for a multi-component project. It explains how pre-releases are automatically generated for `release/*` branches and how stable releases are handled manually from the `main` branch.

## Prerequisites

We use:

* **[semantic-release-monorepo](https://github.com/pmowrer/semantic-release-monorepo)** as an extension of **[semantic-release](https://semantic-release.gitbook.io/semantic-release)** to handle multiple components within a monorepo.
* Docker images are automatically built and pushed for each pre-release and stable release, and they are deployed to both GHCR (GitHub Container Registry) and Docker Hub.
* Pre-releases build images with `develop` tag and automatically deployed to GKE for integration testing.

## Branch strategy

* **Stable releases** are created manually from the `main` branch.
* **Pre-releases** are generated automatically when changes are pushed to any branch matching `release/*`.
* **Feature branches** follow the `feature/*` naming convention for new features.
* **Hotfix branches** use the `hotfix/*` naming convention for critical fixes.
* Pre-releases increment the `rc` version automatically upon each push.

### Branch configuration example

The `semantic-release` configuration for handling releases includes:

```json
{
  "branches": [
    "main",
    { "name": "release/*", "prerelease": "rc" }
  ]
}
```

* The `main` branch handles stable releases, and `release/*` branches are used for pre-releases with the `rc` tag.

## Initial release

We'll start by making the first commit of the project, with the code for the initial release and the message `feat: initial commit`. When pushing that commit to the `main` branch, **semantic-release-monorepo** will release version `1.0.0` for all components and make it available on the default distribution channel (`@latest`).

```text
* feat: initial commit # => v1.0.0 on @latest
```

## Working on a future release

When developing a new version, we create a `release/2.0.0` branch to work on breaking changes or new features. Pre-releases are automatically published for testing purposes, but they are not made available to general users until they are merged into `main`.

```text
* feat: initial commit # => v1.0.0 on @latest
| \
|  * feat: first feature \n\n BREAKING CHANGE: it breaks something # => v2.0.0-rc.1 on @rc
```

With each new feature added and pushed to `release/2.0.0`, a new `rc` version is published:

```text
* feat: initial commit # => v1.0.0 on @latest
| \
|  * feat: first feature \n\n BREAKING CHANGE: it breaks something # => v2.0.0-rc.1 on @rc
|  * feat: second feature # => v2.0.0-rc.2 on @rc
```

## Publishing a stable release

Once all features and changes for version `2.0.0` are complete, the `release/2.0.0` branch can be merged into `main` to create the stable release:

```text
* feat: initial commit # => v1.0.0 on @latest
| \
|  * feat: first feature \n\n BREAKING CHANGE: it breaks something # => v2.0.0-rc.1 on @rc
|  * feat: second feature # => v2.0.0-rc.2 on @rc
*  | fix: a fix # => v1.0.1 on @latest
| /|
*   | Merge branch release/2.0.0 into main # => v2.0.0 on @latest
```

When the merge commit is pushed to `main`, **semantic-release-monorepo** (**after execute workflow to create release**) will publish version `2.0.0` to the default `@latest` channel.

## Examples of release and main workflows

### Example 1: bug fix in main

A bug is identified and fixed directly on `main` without waiting for a full release cycle:

```text
* feat: initial commit # => v1.0.0 on @latest
* fix: patch bug # => v1.0.1 on @latest
```

### Example 2: release candidate iteration

While adding more features in `release/3.0.0`:

```text
* feat: initial commit # => v1.0.0 on @latest
| \
|  * feat: breaking change # => v3.0.0-rc.1 on @rc
|  * feat: new enhancement # => v3.0.0-rc.2 on @rc
*  | fix: urgent fix # => v1.0.2 on @latest
```

### Example 3: new feature in a feature branch

```text
* feat: initial commit # => v1.0.0 on @latest
| \
|  * feat: new API method # => feature/new-api-method
*  | Merge feature/new-api-method into release/2.1.0 # => v2.1.0-rc.1 on @rc
*   | Merge branch release/2.1.0 into main # => v2.1.0 on @latest
```

## Potential issues and mitigations

### Issue: merge conflicts between `release/*` and `main`

* **Cause**: divergence between the `release/*` branch and `main` due to parallel development.
* **Mitigation**: regularly rebase `release/*` branches with `main` to minimize conflicts before final merges.
* **Correction**: if conflicts occur, resolve them manually during the merge process and ensure thorough testing.

### Issue: outdated dependencies in pre-releases

* **Cause**: dependencies might differ between `release/*` and `main` branches.
* **Mitigation**: keep a shared `.nvmrc` and `package.json` synchronized across branches.
* **Correction**: run `npm outdated` and `yarn upgrade` commands before creating new release branches.

### Issue: incorrect tagging of pre-releases

* **Cause**: misconfiguration in `semantic-release` for `rc` tags.
* **Mitigation**: double-check the `release` section in `package.json` to ensure correct tag formatting.
* **Correction**: adjust the `tagFormat` or `branches` configuration and re-run the release.

### Issue: overlapping versions

* **Cause**: multiple branches (e.g., `release/2.0.0` and `release/2.1.0`) pushing similar version tags.
* **Mitigation**: carefully manage branch merges and rebases.
* **Correction**: use distinct versioning for different releases and resolve overlapping tags manually.

## Preparing new components for release

To add a new component to the monorepo, follow these steps:

1. **Create a `package.json` for the component**:

   Use the following template and adjust the values as needed:

   ```json
   {
       "name": "your-component-name",
       "version": "1.0.0",
       "private": true,
       "release": {
           "tagFormat": "your-component-name-v${version}",
           "extends": "semantic-release-monorepo",
           "branches": [
               "main",
               {
                   "name": "release/*",
                   "prerelease": "rc",
                   "channel": "default"
               }
           ],
           "plugins": [
               "@semantic-release/commit-analyzer",
               "@semantic-release/release-notes-generator",
               [
                   "@semantic-release/github",
                   {
                       "published": true,
                       "successComment": false,
                       "failComment": false
                   }
               ]
           ]
       }
   }
   ```

2. **Configure the `tagFormat`**:
   * Ensure the `tagFormat` is unique to the component, such as `your-component-name-v\${version}`.
   * This ensures that tags are correctly associated with the component during releases.

3. **Setup branches for pre-releases**:
   * Pre-releases are configured to be automatically published from `release/*` branches using the `rc` identifier.

4. **Add the component to the monorepo configuration**:
   * Update the `COMPONENTS` list in the main workflow to include the new component.
   * Ensure that any specific linting, testing, or building configurations are added to the GitHub Actions workflows.

5. **Commit and push**:
   * Once the configuration is complete, commit the new `package.json` and push it to the `main` or a `release/*` branch.
   * Verify that the semantic-release configuration triggers the expected behavior in pre-releases and stable releases.
