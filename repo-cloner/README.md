# Repository Cloner

A specialized service within the KDL ecosystem that automatically manages repository cloning for user projects. It continuously monitors project collections in the database and ensures all repositories where a user has access are properly cloned and available for code-server operations.

## Security features

* Non-root user (`kdl`) execution with configurable UID/GID (default `1000:1000`)
* Optimized binary build with debug information removal
* SSH directory permission hardening

## Application

The service can be configured through environment variables and/or a YAML configuration file. The configuration follows a structured approach where MongoDB-related settings are grouped together for better organization.

### Build arguments

| Variable   | Description        | Default |
|------------|--------------------|---------|
| `USER`     | Non-root user name | `kdl`   |
| `UID`      | User ID            | `1000`  |
| `GID`      | Group ID           | `1000`  |

### Environment variables and YAML configuration

MongoDB Configuration:

| Variable                | Description                           | Default                                        |
|-------------------------|---------------------------------------|------------------------------------------------|
| `KDL_SERVER_MONGODB_URI`| MongoDB connection string             | `mongodb://admin:123456@localhost:27017/admin` |
| `DB_NAME`               | Database name                         | `kdl`                                          |

General Configuration:

| Variable                 |  Description                          | Default                                   |
|--------------------------|---------------------------------------|----------------------------------------------|
| `KDL_USER_NAME`          | Username for repository operations    |                                              |
| `REPOS_PATH`             | Repository storage location           | `/home/kdl/repos/`                           |
| `PEM_FILE`               | SSH private key path                  | `/home/kdl/.ssh/id_rsa`                      |
| `PEM_FILE_PASSWORD`      | SSH key password if encrypted         |                                              |
| `CHECK_FREQUENCY_SECONDS`| Repository check interval in seconds  | `10`                                         |

### Configuration

The service supports configuration by Environment variables: set any of the
above environment variables directly.

## Storage

* Repository Storage: Configured through `reposPath` (default: `/home/kdl/repos/`)
* SSH Keys: Located at path specified by `pemFile` (default: `/home/kdl/.ssh/id_rsa`)
* User Home: `/home/kdl`

## Local deployment

Basic usage with environment variables:

```bash
docker run \
  -e "KDL_USER_NAME=developer" \
  -e "KDL_SERVER_MONGODB_URI=mongodb://mongo:27017/kdl" \
  konstellation/kdl-repo-cloner:latest
```

Advanced configuration with SSH key and config file:

```bash
docker run \
  --user 1000:1000 \
  -v ./config.yml:/app/config.yml \
  -e "KDL_USER_NAME=developer" \
  -v /path/to/ssh/key:/home/kdl/.ssh/id_rsa \
  -v /path/to/repos:/home/kdl/repos \
  konstellation/kdl-repo-cloner:latest
```

## Development

### Running tests

All tests:

```bash
go test ./... --tags=integration,unit -v -cover
```

Unit tests only:

```bash
go test ./... -tags=unit -v -cover
```

Integration tests only:

```bash
go test ./... -tags=integration -v -cover
```
