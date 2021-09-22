.DEFAULT_GOAL := help

# AutoDoc
# -------------------------------------------------------------------------
.PHONY: help
help: ## This help.
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
.DEFAULT_GOAL := help

# Docker
# -------------------------------------------------------------------------
.PHONY: docker-lint
docker-lint: ## Lints the Dockerfile
# docker run --rm -i -v ${PWD}:/hadolint --workdir=/hadolint hadolint/hadolint hadolint Dockerfile
	docker run --rm -i -v ${PWD}:/hadolint -v ${PWD}/../.hadolint.yml:/hadolint/.hadolint.yml --workdir=/hadolint hadolint/hadolint < Dockerfile
