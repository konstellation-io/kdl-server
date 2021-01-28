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
  fi

  setup_env
}

setup_env() {
  if [ "$SETUP_ENV" = 1 ]; then
    return
  fi

  # Setup environment to build images inside minikube
  eval "$(minikube docker-env -p "$MINIKUBE_PROFILE")"
  SETUP_ENV=1
}

build_server() {
  setup_env
  build_image kdl-admin-api kdl-server/admin-api
}

build_image() {
  NAME=$1
  FOLDER=$2
  echo_build_header "$NAME"

  run docker build -t konstellation/"${NAME}":latest "$FOLDER"
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
