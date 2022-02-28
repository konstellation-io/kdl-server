# KDL Server UI
## Contributing
You can access contributing documentation [here](./docs/contributing.md).

## Development

To initialize the development environment:

1. Run the mock-server
```bash
# Go to kdl-server/app/ui/mock-server
cd mock-server

# (optional) install deps
yarn install

# Start server on http://localhost:4000
yarn start
```

2. Check if `SERVER_URL` setting on `config.json` has value `http://localhost:4000`
```bash
# Go to kdl-server/app/ui
cd ..

# Modify public/config.json with prefered editor
vim public/config.json
# Example:
{
  "SERVER_NAME": "MockServer",
  "SERVER_URL": "http://localhost:4000",
  "KNOWLEDGE_GALAXY_ENABLED": false,
  "KG_SERVER_URL": "http://localhost:4001",
  "GITEA_URL": "https://gitea.local",
  "RELEASE_VERSION": "kdl-server-0.10.0",
  "DESCRIPTION_MIN_WORDS": 50
}

```

3. Run React app
```bash
# (optional) install deps
yarn install

# Start UI on http://localhost:3001
yarn start
```

## Tests
### Unit tests
* Launch the test runner in the interactive watch mode:
```bash
yarn test
```
* Launch the test runner in the interactive watch mode. It also launches the coverage report:
```bash
yarn test:cov
```
### Integration tests
The integration tests are made with `Cypress`. It accepts headed and headless execution.

* Headed:
```bash
yarn cy
```

* Headless:
```bash
yarn cy:run
```
## Linter

* Pass eslint to all files inside the React application:
```bash
yarn lint
```
* Pass eslint to all files and fix errors:
```bash
yarn lint:fix
```

## Fix vulnerable dependencies

This is equivalent to `npm audit --fix` but with `yarn`:
```bash
yarn audit:fix
```

## Other scripts

## Available Scripts

* Regenerate all `interfaces`, `types` and `enums` for the graphql queries and schema used.
```bash
yarn gen:types
```

* Builds the app for production to the `build` folder.\
  It correctly bundles React in production mode and optimizes the build for the best performance.
  The build is minified, and the filenames include the hashes.
```bash
yarn build
```
