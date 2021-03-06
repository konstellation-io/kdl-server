#!/bin/sh

cmd_build() {
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
  build_drone_authorizer
  build_kg
  build_project_operator
}

build_server() {
  build_image kdl-server app
}

build_drone_authorizer() {
  build_image drone-authorizer app/drone-authorizer
}

build_kg() {
  build_image kdl-kg kg
}

build_project_operator() {
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
