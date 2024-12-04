# DESCRIPCION

Cuando desplegueis un nuevo KDL-Server que contenga este pr (siga apareciendo este mensaje en el repositorio) hay que tener en cuenta que hay una serie de cosas que cambian:

- Tiene un breaking change en la mongo - para la coleccion de "project" cambian sus atributos: external_repo_url -> url y repo_type -> (eliminado)

- Estas son las estructuras en el graphql.schema que han sido eliminadas:
  type Topic
  type SetBoolFieldInput
  type AddUserInput
  enum RepositoryType

- Estas son las estructuras en el graphql.schema que han sido cambiadas:
  input RepositoryInput
  type Repository
  input ExternalRepositoryInput -> RepositoryInput

Todas aquellas peticiones de la UI que hagan uso de estas estructuras han de ser actualizados.

## GUIA DE MIGRACIÓN MONGODB

La Mongo ha de estar a la par con la nueva estructura de datos que se establece para la colección `projects`. Para ello, se ha de ejecutar el siguiente script:

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
