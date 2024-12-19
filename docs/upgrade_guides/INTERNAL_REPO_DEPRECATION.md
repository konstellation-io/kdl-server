# DESCRIPTION

When a new KDL version containing this commit (you can tell so if this upgrade guide still exists) was to be deployed, you will need to take into account some changes and execute the mongodb migration query:

- There is a breaking change in the Mongo - for the collection "project", a couple of its row have changed: external_repo_url -> url y repo_type -> (deprecated)

- These are the structures in the graphql.schema that have been deprecated:
  type Topic
  type SetBoolFieldInput
  type AddUserInput
  enum RepositoryType
  enum RepositoryAuthMethod

  RepositoryInput.credential
  RepositoryInput.authMethod

- These are the structures in the graphql.schema that have been changed:
  input RepositoryInput
  type Repository
  input ExternalRepositoryInput -> RepositoryInput

## MONGODB MIGRATION GUIDE

The MongoDB needs to be aligned with the new data structure for the collection `projects`. For that, you will need to execute the following script:

```mongo
db.projects.updateMany(
  {},
  [
    {
      $set: {
        url: "$external_repo_url"
      }
    },
    {
      $unset: "external_repo_url"
    },
    {
      $unset: "repo_type"
    },
    {
      $unset: "auth_method"
    }
  ]
);
```
