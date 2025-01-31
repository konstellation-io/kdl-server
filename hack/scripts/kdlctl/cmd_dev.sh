#!/bin/sh

cmd_dev() {
  minikube_start "$@"

  # NOTE: Use this loop to capture multiple unsorted args
  while test $# -gt 0; do
    case "$1" in
    # WARNING: Doing a hard reset before deploying
    --hard)
      minikube_hard_reset
      shift
      ;;

    --skip-build)
      SKIP_BUILD=1
      shift
      ;;
    *)
      shift
      ;;
    esac
  done

  minikube_start

  if [ "$MINIKUBE_CLEAN" = "1" ]; then
    minikube_clean
  fi

  if [ "$SKIP_BUILD" = "0" ]; then
    cmd_build "$@"
  else
    sleep 10
  fi

  deploy
}

show_dev_help() {
  echo "$(help_global_header "dev")

    options:
      --hard, --dracarys  remove all contents of minikube kai profile. $(echo_yellow "(WARNING: will re-build all docker images again)").
      --skip-build        skip all docker images build, useful for non-development environments
      --gpu               enables the GPU in minikube

    $(help_global_options)
"
}
