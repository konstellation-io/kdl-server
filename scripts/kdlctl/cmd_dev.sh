#!/bin/sh

cmd_dev() {
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
      --skip-build        skip all docker images build, useful for non-development environments

    $(help_global_options)
"
}
