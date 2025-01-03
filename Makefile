.DEFAULT_GOAL := help

# AutoDoc
# -------------------------------------------------------------------------
.PHONY: help
help: ## This help.
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
.DEFAULT_GOAL := help

.PHONY: docker-lint
docker-lint: ## Lints Dockerfile defined in dir Example: make docker-lint dir=app
	docker run --rm -i -v ${PWD}:/hadolint -v ${PWD}/.github/.hadolint.yml:/hadolint/.hadolint.yml --workdir=/hadolint hadolint/hadolint < $(dir)/Dockerfile

.PHONY: tidy
tidy: ## Run golangci-lint, goimports and gofmt
	golangci-lint run --config .github/.golangci.yml --build-tags=integration,unit app/api/... repo-cloner/... && goimports -w app/api repo-cloner && gofmt -s -w -e -d app/api repo-cloner

.PHONY: create
create: ## Creates a complete local environment
	cd hack && ./kdlctl.sh dev && cd -

.PHONY: start-microk8s
start-microk8s: ## Starts microk8s
	cd hack && ./kdlctl.sh start && cd -

.PHONY: stop-microk8s
stop-microk8s: ## Stops microk8s
	cd hack && ./kdlctl.sh stop && cd -

.PHONY: build
build: ## Builds docker images and pushes them to the microk8s registry
	cd hack && ./kdlctl.sh build && cd -

.PHONY: deploy
deploy: ## Deploys Helm charts
	cd hack && ./kdlctl.sh deploy && cd -

.PHONY: restart
restart: ## Restarts kdl pods and microk8s (use after build)
	cd hack && ./kdlctl.sh restart && cd -

.PHONY: refresh-certs
refresh-certs: ## Refreshes the certificates
	cd hack && ./kdlctl.sh refresh-certs && cd -

.PHONY: uninstall
uninstall: ## Remove all microk8s resources
	cd hack && ./kdlctl.sh uninstall && cd -

.PHONY: test-api
test-api: ## Executes api tests
	cd app/api && go test ./... --tags=integration,unit -v && cd -

.PHONY: coverage-api
coverage-api: ## Executes api tests, generates coverage and opens the browser
	cd app/api && go test ./... --tags=integration,unit -v -cover -coverprofile=coverage.out && go tool cover -html=coverage.out && rm coverage.out && cd -
