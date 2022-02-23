# Admin-api

Structure based on: https://eltonminetto.dev/en/post/2020-07-06-clean-architecture-2years-later/

## Local development

In order to develop in a local environment there are several things to consider:

1. You need kdl up and running
2. Port-forward the mongodb inside kdl `kubectl -n kdl port-forward pods/kdl-mongo-0 27017:27017`
3. Port-forward the gitea inside kdl `kubectl -n kdl port-forward pods/gitea-0 3001:3000`
4. Port-forward the gitea inside kdl `kubectl -n kdl port-forward pods/[MINIO-POD-ID] 9001:9001`
5. Load the environment variables (they are located in `app/api/.env.dev`):
6. run `go run http/main.go` (or launch it from your preferred IDE)
7. You can now access the graphQL playground at `http://localhost:3000/api/playground`


## Testing

To create new tests install [GoMock](https://github.com/golang/mock). Mocks used on tests are generated with
**mockgen**, when you need a new mock, add the following:

```go
//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}
```

To generate the mocks execute:
```sh
$ go generate ./...
```

### Run tests

```sh
go test ./...
```

## Linters

`golangci-lint` is a fast Go linters runner. It runs linters in parallel, uses caching, supports yaml config, has
integrations with all major IDE and has dozens of linters included.

As you can see in the `.golangci.yml` config file of this repo, we enable more linters than the default and
have more strict settings.

To run `golangci-lint` execute:
```
golangci-lint run
```

