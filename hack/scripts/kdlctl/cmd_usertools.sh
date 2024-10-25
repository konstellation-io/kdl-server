#!/bin/sh

cmd_usertools() {
    TYPE=${1:-"recreate"}

    if [ "$TYPE" = "recreate" ]; then
      recreate_usertools
    fi

    if [ "$TYPE" = "microk8s" ]; then
      microk8s_stop
      microk8s_start "$@"
    fi
}

show_usertools_help() {
  echo "$(help_global_header "usertools <type>")

    types:
      recreate  deletes and re-creates the CDR for usertools

    $(help_global_options)
"
}

recreate_usertools() {
  microk8s_kubeconfig

  run kubectl -n "${NAMESPACE}" delete usertools usertools-kdladmin &
  run kubectl -n "${NAMESPACE}" patch usertools usertools-kdladmin -p '{"metadata":{"finalizers":[]}}' --type=merge

  echo_wait "Deleted usertools-kdladmin"

  build_docker_images
  deploy
}
