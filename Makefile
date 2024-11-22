.DEFAULT_GOAL := help

# AutoDoc
# -------------------------------------------------------------------------
.PHONY: help
help: ## This help.
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
.DEFAULT_GOAL := help

.PHONY: docker-lint
docker-lint: ## Lints Dockerfile defined in dir Example: make docker-lint dir=app/api
	docker run --rm -i -v ${PWD}:/hadolint -v ${PWD}/.github/.hadolint.yml:/hadolint/.hadolint.yml --workdir=/hadolint hadolint/hadolint < $(dir)/Dockerfile

.PHONY: tidy
tidy: ## Run golangci-lint, goimports and gofmt
	golangci-lint run --config .github/.golangci.yml app/api/... cleaner/... gitea-oauth2-setup/... repo-cloner/... && goimports -w app/api cleaner gitea-oauth2-setup repo-cloner && gofmt -s -w -e -d app/api cleaner gitea-oauth2-setup repo-cloner
