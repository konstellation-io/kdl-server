# How to contribute to KDL

This document provides guidelines for contributing to the *KDL* project.

## How can I contribute?

### Did you find a bug?

* **Ensure the bug has not already been reported** by searching on GitHub under [Issues](https://github.com/konstellation-io/kdl-server/issues).
* If you cannot find an open issue addressing the problem, [open a new one](https://github.com/konstellation-io/kdl-server/issues/new). Include a **title and clear description**, as much relevant information as possible, and a **code sample** or an **executable test case** demonstrating the unexpected behavior.
* Use the relevant bug report templates to create the issue, if available.

### Do you intend to add a new feature or change an existing one?

* Please discuss first ([open an issue](https://github.com/konstellation-io/kdl-server/issues)) before starting any significant pull request (e.g., implementing features, refactoring code) to avoid spending time on something that might not be merged.
* Adhere to the project's coding conventions (indentation, accurate comments, etc.) and any other requirements (such as test coverage, documentation).

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
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...").
* Example: `feat/add-new-feature`.

### Git Commit Messages

* Based on [`semantic-release`](https://github.com/semantic-release/semantic-release) commit message conventions.
* Use the present tense ("Add feature" not "Added feature").
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...").
* Limit the first line to 72 characters or less.
* Reference issues and pull requests liberally after the first line.
* Example:

    ```console
    feat(component): Add new feature

    My commit description
    ```
