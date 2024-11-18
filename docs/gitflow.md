# GitFlow: publishing hotfix, pre-releases and stable releases

Manages hotfix, pre-releases and stable releases using `semantic-release-monorepo` for a multi-component project. It explains how pre-releases are automatically generated for `release/*` branches, hotfix automatically generated for `hotfix/X.Y.Z` and how stable releases are handled manually from the `main` branch.

## Prerequisites

We use:

* **[semantic-release-monorepo](https://github.com/pmowrer/semantic-release-monorepo)** as an extension of **[semantic-release](https://semantic-release.gitbook.io/semantic-release)** to handle multiple components within a monorepo.
* Docker images are automatically built and pushed for each pre-release and stable release, and they are deployed to both GHCR (GitHub Container Registry) and Docker Hub.
* Pre-releases build images with `develop` tag and automatically deployed to [GKE for integration](./gke-integration.md) environment.

## Branch strategy

* **Stable releases** are created manually from the `main` branch.
* **Pre-releases** are generated automatically when changes are pushed to any branch matching `release/*`.
  * Pre-releases increment the `rc` version automatically upon each push.
* **Feature branches** follow the `feature/*` naming convention for new features.
* **Hotfix branches** use the `hotfix/*` naming convention for critical fixes. Follow [hotfix section](#hotfix) to understand how-to work with it.

### Branch configuration example

The `semantic-release` configuration for handling releases includes:

```json
{
  "branches": [
    "..."
    {
      "channel": "default",
      "name": "release/*",
      "prerelease": "rc"
    }
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

## Working on a hotfix

Hotfix branches are used to fix bugs or add minor updates to previously released versions without disrupting ongoing development.

```text
* feat: initial commit # => v1.0.0 on @latest
| \
|  * feat: first feature \n\n BREAKING CHANGE: it breaks something # => v2.0.0
*  | fix: address issue with API validation # => v1.0.1 on @latest
| /|
|  * Merge hotfix/1.0.1 into main # => included in @latest
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

## Hotfix

Hotfix branches are used to fix bugs or add minor updates to previously published releases. These branches operate independently of ongoing feature or pre-release development, ensuring stability in production while addressing urgent issues. More info. on [maintenance-branches](https://semantic-release.gitbook.io/semantic-release/usage/workflow-configuration#maintenance-branches).

### Hotfix workflow requirements

* A `hotfix/X.Y.Z` branch **must** be created for any bug fix or update targeting a previous release.
* Ensure that the branch name strictly follows the format `hotfix/X.Y.Z` to comply with `semantic-release` configuration.
* Hotfixes **require** that a subsequent release exists. For example, if version `1.0.0` is the last release, a hotfix cannot be created unless version `1.1.0` or `2.0.0` is published.

### Behavior of hotfix branches

1. **branch naming convention**: all hotfix branches must be named `hotfix/X.Y.Z`. For example:
   * `hotfix/1.0.1`: A bug fix for version `1.0.0`.
   * `hotfix/1.1.x`: Allows for incremental updates to the `1.1.0` release series.

2. **Version rules**:
   * If version `1.0.0` is published, and version `1.1.0` exists:
     * A branch `hotfix/1.0.1` will generate a patch (`1.0.1`) for bug fixes (`fix`).
     * A branch `hotfix/1.1.x` will generate a minor update (`1.1.0`) for new features (`feat`).
   * If version `1.0.0` is published and the next release is `2.0.0`:
     * Hotfixes on `1.x` can include:
       * Minor updates (`feat`) generating `1.1.0`.
       * Patch updates (`fix`) generating `1.0.1`.

3. **semantic-release rules**: the version increment (`major`, `minor`, `patch`) depends on the type of commit:
   * `feat`: Generates a minor or major release.
   * `fix`: Generates a patch release.

### Hotfix branch setup in `semantic-release`

The following configuration ensures `semantic-release` can handle hotfix branches:

```json
{
  "release": {
    "branches": [
      "...",
      {
        "name": "hotfix/+([0-9])?(.{+([0-9]),x}).x",
        "range": "${name.replace(/^hotfix\\//g, '')}",
        "prerelease": false,
        "channel": "${name.replace(/^hotfix\\//g, '')}"
      }
    ]
  }
}
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
      "name": "component",
      "version": "1.0.0",
      "private": true,
      "release": {
        "tagFormat": "component-v${version}",
        "extends": "semantic-release-monorepo",
        "branches": [
          "main",
          {
            "channel": "default",
            "name": "release/*",
            "prerelease": "rc"
          },
          {
            "channel": "default",
            "name": "hotfix/+([0-9])?(.{+([0-9]),x}).x",
            "prerelease": false,
            "range": "${name.replace(/^hotfix\\//g, '')}"
          }
        ],
        "plugins": [
          "@semantic-release/commit-analyzer",
          [
            "@semantic-release/git",
            {
              "assets": [
                "**/package.json"
              ],
              "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
            }
          ],
          [
            "@semantic-release/github",
            {
              "failComment": false,
              "published": true,
              "successComment": false
            }
          ],
          [
            "@semantic-release/release-notes-generator",
            {
              "preset": "conventionalcommits",
              "presetConfig": {
                "types": [
                  {
                    "type": "chore",
                    "section": "Miscellaneous Chores"
                  },
                  {
                    "type": "ci",
                    "section": "Continuous Integration",
                    "hidden": true
                  },
                  {
                    "type": "docs",
                    "section": "Documentation",
                    "hidden": true
                  },
                  {
                    "type": "feat",
                    "section": "Features"
                  },
                  {
                    "type": "fix",
                    "section": "Bug Fixes"
                  },
                  {
                    "type": "refactor",
                    "section": "Code Refactoring"
                  }
                ]
              }
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
