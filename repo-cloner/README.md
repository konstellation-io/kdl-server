# User Repo Cloner

This module is responsible for automatically cloning the internal and external repositories of the projects in which the
user participates. This way they are available for code-server to be able to work with it.

To do this, it checks periodically the projects collection in the database, to locate the ones that the user is
included in. So, those who do not have a folder with the code, try to clone the repository. For this it is necessary
that the user's public key is included in the platform where the repository is stored (github, gitlab, gitea etc), so
that cloning through ssh is possible.

## Run tests

```console
go test ./... --tags=integration,unit -v -cover
```

Run only unit tests

```console
go test ./... -tags=unit -v -cover
```

Run only integration tests

```console
go test ./... -tags=integration -v -cover
```

## Configuration

| Environment variable      | Default                                      | Description                                                               |
| ------------------------- | -------------------------------------------- | ------------------------------------------------------------------------- |
| KDL_USER_NAME             | user                                         | (required) username from which the repositories are to be cloned.         |
| REPOS_PATH                | /home/kdl/repos/                             | (optional) absolute path to store the cloned repositories.                |
| PEM_FILE                  | /home/kdl/.ssh/id_rsa                        | (optional) absolute path to user private ssh key.                         |
| PEM_FILE_PASSWORD         |                                              | (optional) password for user private ssh key.                             |
| CHECK_FREQUENCY_SECONDS   | 10                                           | (optional) frequency of checking new repositories (seconds)               |
| KDL_SERVER_MONGODB_URI    | mongodb://admin:123456@localhost:27017/admin | (optional) mongoDB URI.                                                   |
| DB_NAME                   | kdl                                          | (optional) KDL database name.                                             |
| PROJECT_COLL_NAME         | projects                                     | (optional) projects collection name.                                      |
| USER_COLL_NAME            | users                                        | (optional) user collection name.                                          |
