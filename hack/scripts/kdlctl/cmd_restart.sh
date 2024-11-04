#!/bin/sh

cmd_restart() {
    TYPE=${1:-"kdl"}

    if [ "$TYPE" = "kdl" ]; then
      restart_kdl_pods
    fi

    if [ "$TYPE" = "microk8s" ]; then
      microk8s_stop
      microk8s_start "$@"
    fi
}

show_restart_help() {
  echo "$(help_global_header "restart <type> [options]")

    types:
      microk8s  restarts microk8s.
      kdl       restarts pods on kdl namespace (default option).

    options:
      --gpu enables the GPU in MicroK8s

    $(help_global_options)
"
}

restart_kdl_pods() {
  microk8s_kubeconfig

  POD_NAMES=$(kubectl -n "${NAMESPACE}" get pod -o custom-columns=":metadata.name" --no-headers | tr '\n' ' ')

  if [ -z "$POD_NAMES" ]; then
    echo_fatal "no pods to restart"
    return
  fi

  echo_wait "Restarting kdl pods"
  # shellcheck disable=SC2086 # this behaviour is expected here
  run kubectl -n "${NAMESPACE}" delete pod ${POD_NAMES} --grace-period=0
}
