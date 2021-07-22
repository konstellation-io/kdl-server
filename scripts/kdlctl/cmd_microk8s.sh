
ENABLE_GPU=0
microk8s_start() {
  while test $# -gt 0; do
     case "$1" in
       --gpu)
         ENABLE_GPU=1
         shift
       ;;
       *)
         shift
       ;;
     esac
   done

  MICROK8S_STATUS=$(microk8s.status)
  case "$MICROK8S_STATUS" in
    *"is running"*)
      echo_check "Microk8s already running"
      microk8s_enable_addons
      return
      ;;
  esac

  microk8s.start

  microk8s_enable_addons

  microk8s_kubeconfig
}

microk8s_enable_addons() {
  echo_info "Checking if all microk8s addons are enabled"
  microk8s.enable host-access:ip=$HOST_IP dns storage ingress registry

  if [ "$ENABLE_GPU" = "1" ]; then
    echo_info "⚙️ Enabling microk8s GPU..."
    microk8s.enable gpu
  fi
}

microk8s_kubeconfig() {
  export KUBECONFIG=${HOME}/.kube/config-microk8s
  microk8s.config > ${KUBECONFIG}
}

microk8s_stop() {
  microk8s.stop
}
