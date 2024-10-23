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
  build_gitea_oauth2_setup
  build_project_operator
  build_user_tools_operator
  build_vscode
  build_repo_cloner
  build_mlflow
  build_kg
  build_backup
}

build_server() {
  build_image kdl-server app
}

build_drone_authorizer() {
  build_image drone-authorizer drone-authorizer
}

build_gitea_oauth2_setup() {
  build_image gitea-oauth2-setup gitea-oauth2-setup
}

build_project_operator() {
  build_image project-operator project-operator
}

build_user_tools_operator() {
  build_image user-tools-operator user-tools-operator
}

build_vscode() {
  build_image vscode vscode
}

build_repo_cloner() {
  build_image repo-cloner repo-cloner
}

build_mlflow() {
  build_image mlflow mlflow
}

build_kg() {
    if [ "$KNOWLEDGE_GALAXY_LOCAL" != "true"  ]; then
        echo_info "ℹ️ Knowledge Galaxy disabled. skipping build."
        return
    fi

    if [ ! -d $KNOWLEDGE_GALAXY_PATH ] || [ -z $KNOWLEDGE_GALAXY_PATH ]; then
      echo_warning "\$KNOWLEDGE_GALAXY_PATH=\"${KNOWLEDGE_GALAXY_PATH}\" is invalid. skipping build."
      return
    fi

    build_image knowledge-galaxy $KNOWLEDGE_GALAXY_PATH
}

build_backup() {
  build_image kdl-backup backup
}

build_image() {
  NAME=$1
  FOLDER=$2
  echo_build_header "$NAME"

  run docker build --network host -t ${DOCKER_REGISTRY_HOST}:32000/konstellation/"${NAME}":latest "$FOLDER"
  run docker push ${DOCKER_REGISTRY_HOST}:32000/konstellation/"${NAME}":latest
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
