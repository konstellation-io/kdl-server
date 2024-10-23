# How to contribute to KDL

This document provides guidelines for contributing to the *KDL* project.

## How can I contribute?

## Sign off contributions (DCO)

The Developer Certificate of Origin (DCO) is a lightweight way for contributors to certify that they wrote or otherwise have the right to submit the code they are contributing to the project.
Here is the full text of the [DCO](http://developercertificate.org/).

Contributors must sign-off that they adhere to these requirements by adding a `Signed-off-by` line to commit messages.

```text
This is my commit message

Signed-off-by: Random J Developer <random@developer.example.org>
```

See `git help commit`:

```text
-s, --signoff
    Add Signed-off-by line by the committer at the end of the commit log
    message. The meaning of a signoff depends on the project, but it typically
    certifies that committer has the rights to submit this work under the same
    license and agrees to a Developer Certificate of Origin (see
    http://developercertificate.org/ for more information).
```

### Submitting Pull Requests

**Please follow these basic steps to simplify pull request reviews. If you don't you'll probably just be asked to anyway.**

* Please rebase your branch against the current main.
* Run the `Setup` command to make sure your development dependencies are up-to-date.
* Please ensure the test suite passes before submitting a PR.
* If you've added new functionality, **please** include tests which validate its behavior.
* Make reference to possible [issues](https://github.com/ngrx/platform/issues) on PR comment.

### Did you find a bug?

* **Ensure the bug has not already been reported** by searching on GitHub under [Issues](https://github.com/konstellation-io/kdl-server/issues).
* If you cannot find an open issue addressing the problem, [open a new one](https://github.com/konstellation-io/kdl-server/issues/new). Include a **title and clear description**, as much relevant information as possible, and a **code sample** or an **executable test case** demonstrating the unexpected behavior.
* Use the relevant bug report templates to create the issue, if available.
* Please detail the affected browser(s) and operating system(s).

### Do you intend to add a new feature or change an existing one?

* Please discuss first ([open an issue](https://github.com/konstellation-io/kdl-server/issues)) before starting any significant pull request (e.g., implementing features, refactoring code) to avoid spending time on something that might not be merged.
* Adhere to the project's coding conventions (indentation, accurate comments, etc.) and any other requirements (such as test coverage, documentation).
* The feature will be discussed and considered.
* Once the PR is submitted, it will be reviewed and merged once approved.

## Styleguides

### YAML Styleguide

All YAML files must adhere to the following style guide:

* Indentation: Use 2 spaces for indentation.
* No trailing spaces.
* Use hyphens for list items.
* Use camelCase for key names.
* Ensure there are no syntax errors.

Additional rules:

* Always use double quotes for strings.
* Keep lines to a maximum of 80 characters.
* Ensure proper alignment of nested elements.

### Branches

* Use the present tense ("Add feature" not "Added feature").
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Don't capitalize the first letter
* Example:
  * Internal team members: `<type>/JIRA-TICKET-ID-add-new-feature`
  * Community: `<type>/add-new-feature`

### Git Commit Messages

* Based on [`semantic-release`](https://github.com/semantic-release/semantic-release) commit message conventions.

The table below shows which commit message gets you which release type when `semantic-release` runs (using the default configuration):

| Commit message                                                                                                                                                                                   | Release type                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `fix(pencil): stop graphite breaking when too much pressure applied`                                                                                                                             | ~~Patch~~ Fix Release                                                                                           |
| `feat(pencil): add 'graphiteWidth' option`                                                                                                                                                       | ~~Minor~~ Feature Release                                                                                       |
| `perf(pencil): remove graphiteWidth option`<br><br>`BREAKING CHANGE: The graphiteWidth option has been removed.`<br>`The default graphite width of 10mm is always used for performance reasons.` | ~~Major~~ Breaking Release <br /> (Note that the `BREAKING CHANGE: ` token must be in the footer of the commit) |

* Use the present tense ("Add feature" not "Added feature").
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Don't capitalize the first letter
* Don't use dot (.) at the end
* Limit the first line to 72 characters or less.
* Reference issues and pull requests liberally after the first line.
* Scheme:

```console
<type>(<component>): <[JIRA-TICKET-ID]> <subject>
<NEWLINE>
<commit description>
<NEWLINE>
<footer>
```

* Examples (only team members should use the JIRA ticket ID):

```console
docs(readme): update Helm chart installation
```

```console
feat(api): [KDL6-25] Mongodb integration testing suite

- Create a test suite for MongoDB package. Integration testing with testcontainers.
- Refactor all MongoDB package to fit Golang testing good practices.
- Renamed the utils/mongodb package to mongodbutils.
- Fixed time setting in creation of user_activities
- Updated all go modules dependencies
- Generated gqlgen resolvers again

Closes #984
```

### Revert

If the commit reverts a previous commit, it should begin with `revert:`, followed by the header of the reverted commit. In the body it should say: `This reverts commit <hash>.`, where the hash is the SHA of the commit being reverted.

### Type

| Type      | Description                                        | Release           |
| --------- | -------------------------------------------------- | ----------------- |
| **docs**  | changes on documentation                           | no release        |
| **feat**  | new feature                                        | minor release     |
| **fix**   | bug fix                                            | patch fix release |
| **style** | guidestyle on code (white-space, formatting, etc.) | no release        |

### Component

The following is the list of supported component:

* `api`
* `ui`
* `backup`
* `cleaner`
* `drone`
* `gitea`
* `mlflow`
* `project-operator`
* `repo-cloner`
* `user-tools`
* `vscode`

### Subject

The subject contains a succinct description of the change:

* Use the present tense ("Add feature" not "Added feature").
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Don't capitalize the first letter
* Don't use dot (.) at the end

### Footer

The footer only uses for **Breaking Changes** and is also the place to reference GitHub issues that this commit **Closes**.

**Breaking Changes** must start with `BREAKING CHANGE:`, like `semantic-release` does.

Example:

```console
<type>(compoenent): <subject>

BREAKING CHANGES:

Describe breaking changes here

Closes #<issue-number>
```
