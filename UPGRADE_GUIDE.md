# DESCRIPTION

When a new KDL version containing this commit (you can tell so if this upgrade guide still exists) were to be deployed, you will need to make some changes and take into account some others that have changed:

- There is a breaking change in the Mongo - for the collection "project", a couple of its row have changed: external_repo_url -> url y repo_type -> (deprecated)

- These are the structures in the graphql.schema that have been deprecated:
  type Topic
  type SetBoolFieldInput
  type AddUserInput
  enum RepositoryType

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
    }
  ]
);
```
