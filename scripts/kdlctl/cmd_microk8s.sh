
microk8s_start() {
  MICROK8S_STATUS=$(microk8s.status)
  case "$MICROK8S_STATUS" in
    *"is running"*)
      echo_check "Microk8s already running"
      return
      ;;
  esac

  microk8s.start
  microk8s.enable dns storage ingress registry

  if [ "$ENABLE_GPU" = "1" ]; then
    echo "⚙️ Enabling Microk8s GPU..."
    microk8s.enable gpu
  fi

  microk8s_kubeconfig
}

microk8s_kubeconfig() {
  export KUBECONFIG=${HOME}/.kube/config-microk8s
  microk8s.config > ${KUBECONFIG}
}

microk8s_stop() {
  microk8s.stop
}
