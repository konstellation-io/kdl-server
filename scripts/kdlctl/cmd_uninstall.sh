#!/bin/sh

cmd_uninstall() {
  microk8s_kubeconfig

  while true; do
    read -p "⚠️ Do you wish to uninstall KDL? CAUTION: all data will be permanently deleted. (y/n) " yn
    case $yn in
    [Yy]*)
      echo_info "Deleting \"$RELEASE_NAME\" helm release..."
      helmfile -f scripts/helmfile/helmfile.yaml delete

      echo_info "Deleting usertools in \"$NAMESPACE\" k8s namespace..."
      USERTOOL_NAMES=$(kubectl get usertools -n kdl | tail -n +2 | awk '{print $1}')
      for NAME in $USERTOOL_NAMES; do
        echo_info "   - Deleting \"$NAME\" usertool finalizer..."
        kubectl -n ${NAMESPACE} patch usertools $NAME --type json --patch='[ { "op": "remove", "path": "/metadata/finalizers" } ]'
      done

      echo_info "Deleting \"$NAMESPACE\" k8s namespace..."
      kubectl delete ns $NAMESPACE --force --grace-period 0

      break
      ;;
    [Nn]*) exit ;;
    *) echo "Please answer y[yes] or n[no]." ;;
    esac
  done
}
