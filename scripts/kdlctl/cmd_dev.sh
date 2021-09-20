#!/bin/sh

cmd_dev() {
  microk8s_start "$@"

  # NOTE: Use this loop to capture multiple unsorted args
   while test $# -gt 0; do
     case "$1" in
       --skip-build)
         SKIP_BUILD=1
         shift
       ;;
       *)
         shift
       ;;
     esac
   done

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
      --skip-build        skip all docker images build, useful for non-development environments
      --gpu enables the GPU in MicroK8s

    $(help_global_options)
"
}
