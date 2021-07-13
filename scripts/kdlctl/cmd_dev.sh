#!/bin/sh

# disable unused vars check, vars are used on functions inside subscripts
# shellcheck disable=SC2034 # https://github.com/koalaman/shellcheck/wiki/SC2034

cmd_dev() {
  # NOTE: Use this loop to capture multiple unsorted args
  # while test $# -gt 0; do
  #   case "$1" in
  #     # WARNING: Doing a hard reset before deploying
  #     --hard|--dracarys)
  #       MINIKUBE_RESET=1
  #       shift
  #     ;;

  #     --skip-build)
  #       SKIP_BUILD=1
  #       shift
  #     ;;

  #     *)
  #       shift
  #     ;;
  #   esac
  # done

  # if [ "$MINIKUBE_RESET" = "1" ]; then
  #   minikube_hard_reset
  # fi

  microk8s_clean
  microk8s_start

  if [ "$SKIP_BUILD" = "0" ]; then
    cmd_build "$@"
  else
    sleep 10
  fi

  IP=$(hostname -I | cut -d' ' -f1)
  export DOMAIN=kdl.$IP.nip.io
  deploy
}

show_dev_help() {
  echo "$(help_global_header "dev")

    options:
      --hard, --dracarys  remove all contents of minikube kdl profile. $(echo_yellow "(WARNING: will re-build all docker images again)").
      --skip-build        skip all docker images build, useful for non-development environments
      --frontend-mock     starts a local mock server to avoid calling the actual API during Frontend development.
      --local-frontend    starts a local server outside from kubernetes for faster development.
      --monoruntime       starts a local server with a single runtime.

    $(help_global_options)
"
}
