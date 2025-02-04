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
  build_server
  build_project_operator
  build_user_tools_operator
  build_repo_cloner
  build_filebrowser
  build_mlflow
  build_kg
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
  eval "$(minikube docker-env -p "$MINIKUBE_PROFILE")"
  SETUP_ENV=1
}

build_image() {
  NAME="$1"
  FOLDER="$2"
  echo_build_header "$NAME"
  setup_env

  docker build -t ${IMAGE_REGISTRY}/konstellation/${NAME}:latest ../${FOLDER} || exit 1
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
