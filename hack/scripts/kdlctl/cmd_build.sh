#!/bin/sh

cmd_build() {
  # initialize vars
  SETUP_ENV=0

  build_docker_images
}

show_build_help() {
  echo "$(help_global_header "build")

Build all KDL docker images.

$(help_global_options)
"
}

build_docker_images() {
  setup_env
  build_server
  build_project_operator
  build_user_tools_operator
  build_repo_cloner
  build_filebrowser
  build_mlflow
  build_kg
  clean_env
}

build_server() {
  build_image kdl-server app
}

build_project_operator() {
  build_image kdl-project-operator project-operator
}

build_user_tools_operator() {
  build_image kdl-user-tools-operator user-tools-operator
}

build_repo_cloner() {
  build_image kdl-repo-cloner repo-cloner
}

build_filebrowser() {
  build_image kdl-filebrowser filebrowser
}

build_mlflow() {
  build_image kdl-mlflow mlflow
}

build_kg() {
  if [ "$KNOWLEDGE_GALAXY_LOCAL" != "true" ]; then
    echo_info "ℹ️ Knowledge Galaxy disabled. skipping build."
    return
  fi

  if [ ! -d $KNOWLEDGE_GALAXY_PATH ] || [ -z $KNOWLEDGE_GALAXY_PATH ]; then
    echo_warning "\$KNOWLEDGE_GALAXY_PATH=\"${KNOWLEDGE_GALAXY_PATH}\" is invalid. skipping build."
    return
  fi

  build_image kdl-knowledge-galaxy $KNOWLEDGE_GALAXY_PATH
}

setup_env() {
  if [ "$SETUP_ENV" = 1 ]; then
    return
  fi

  # Setup environment to build images inside minikube
  eval "$(minikube docker-env -p "${MINIKUBE_PROFILE}")"

  # if [ "${OS}" = "Darwin" ]; then
  if [ -z "$(docker ps --format "{{.Names}}" | egrep -E '^(socat)$')" ]; then
    docker run --name socat --rm -it -d --network=host alpine ash \
      -c "apk add socat && socat TCP-LISTEN:5000,reuseaddr,fork TCP:$(minikube ip -p "${MINIKUBE_PROFILE}"):5000" &&
      curl -s -o /dev/null --connect-timeout 2 "http://${IMAGE_REGISTRY}/v2/_catalog" 2>/dev/null ||
      exit 1
  fi
  # fi

  SETUP_ENV=1
}

clean_env() {
  # if [ "${OS}" = "Darwin" ]; then
  docker ps --format "{{.Names}}" | egrep -E '^(socat)$' | xargs --no-run-if-empty docker stop
  # fi
}

build_image() {
  NAME="$1"
  FOLDER="$2"
  echo_build_header "$NAME"

  # if [ "${OS}" = "Darwin" ]; then
  # works with IMAGE_REGISTRY="localhost:5000"
  docker build -t ${IMAGE_REGISTRY}/konstellation/${NAME}:latest ../${FOLDER} || exit 1
  docker push ${IMAGE_REGISTRY}/konstellation/${NAME}:latest || exit 1
  # fi
}

echo_build_header() {
  if [ "$VERBOSE" = "1" ]; then
    BORDER="$(echo_light_green "##")"
    echo
    echo_light_green "#########################################"
    printf "%s 🏭  %-37s   %s\n" "$BORDER" "$(echo_yellow "$*")" "$BORDER"
    echo_light_green "#########################################"
    echo
  else
    echo_info "  🏭 $*"
  fi
}
