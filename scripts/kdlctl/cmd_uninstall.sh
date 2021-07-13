#!/bin/sh

cmd_uninstall() {
  microk8s_kubeconfig

  while true; do
    read -p "⚠️ Do you wish to uninstall KDL? CAUTION: all data will be permanently deleted. (y/n) " yn
    case $yn in
    [Yy]*)
      echo_info "Deleting \"$RELEASE_NAME\" helm release..."
      helm delete "$RELEASE_NAME" -n $NAMESPACE

      echo_info "Deleting \"$NAMESPACE\" k8s namespace..."
      kubectl delete ns $NAMESPACE --force --grace-period 0

      break
      ;;
    [Nn]*) exit ;;
    *) echo "Please answer y[yes] or n[no]." ;;
    esac
  done
}
