#!/bin/sh

CLEAN_DOCKER=0
SETUP_ENV=0
BUILD_SERVER=0

cmd_build() {
  # NOTE: Use this loop to capture multiple unsorted args
  while test $# -gt 0; do
    case "$1" in
     --clean)
      CLEAN_DOCKER=1
      shift
    ;;
    --server)
      BUILD_SERVER=1
      BUILD_ALL=0
      shift
    ;;
    *)
     shift
     ;;
    esac
  done

  if [ "$CLEAN_DOCKER" = "1" ]; then
    minikube_clean
  fi
  build_docker_images
}

show_build_help() {
  echo "$(help_global_header "build")

    options:
      --clean          sends a prune command to remove old docker images and containers. (will keep last 24h).
      --server        build only kdl server .

    $(help_global_options)
"
}

build_docker_images() {
  # Server
  if [ "$BUILD_SERVER" = "1" ] || [ "$BUILD_ALL" = "1" ]; then
    build_server
    build_drone_authorizer
    build_kg
    build_project_operator
  fi

  setup_env
}

setup_env() {
  echo "TODO remove setup_env"
#  if [ "$SETUP_ENV" = 1 ]; then
#    return
#  fi
#
#  # Setup environment to build images inside minikube
#  eval "$(minikube docker-env -p "$MINIKUBE_PROFILE")"
#  SETUP_ENV=1
}

build_server() {
  setup_env
  build_image kdl-server app
}

build_drone_authorizer() {
  setup_env
  build_image drone-authorizer app/drone-authorizer
}

build_kg() {
  setup_env
  build_image kdl-kg kg
}

build_project_operator() {
  setup_env
  build_image project-operator project-operator
}

build_image() {
  NAME=$1
  FOLDER=$2
  echo_build_header "$NAME"

  run docker build --network host -t localhost:32000/konstellation/"${NAME}":latest "$FOLDER"
  run docker push localhost:32000/konstellation/"${NAME}":latest
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
