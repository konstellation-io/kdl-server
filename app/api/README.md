# Admin-api

Structure based on: https://eltonminetto.dev/en/post/2020-07-06-clean-architecture-2years-later/

## Testing

To create new tests install [GoMock](https://github.com/golang/mock). Mocks used on tests are generated with 
**mockgen**, when you need a new mock, add the following:

```go
//go:generate mockgen -source=${GOFILE} -destination=$PWD/mocks/${GOFILE} -package=mocks
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