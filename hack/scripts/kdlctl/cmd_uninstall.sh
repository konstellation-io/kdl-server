#!/bin/sh

cmd_uninstall() {

  while true; do
    read -p "⚠️ Do you wish to uninstall KDL? CAUTION: all data will be permanently deleted. (y/n) " yn
    case $yn in
    [Yy]*)
      echo_info "Deleting \"$RELEASE_NAME\" helm release..."
      helmfile -f scripts/helmfile/helmfile.yaml delete

      echo_info "Deleting kdlusertools in \"$NAMESPACE\" k8s namespace..."
      KDLUSERTOOL_NAMES=$(kubectl get kdlusertools -n kdl | tail -n +2 | awk '{print $1}')
      for NAME in $KDLUSERTOOL_NAMES; do
        echo_info "   - Deleting \"$NAME\" kdlusertools finalizer..."
        kubectl -n ${NAMESPACE} patch kdlusertools $NAME --type json --patch='[ { "op": "remove", "path": "/metadata/finalizers" } ]'
      done

      echo_info "Deleting kdlprojects in \"$NAMESPACE\" k8s namespace..."
      KDLPROJECT_NAMES=$(kubectl get kdlprojects -n kdl | tail -n +2 | awk '{print $1}')
      for NAME in $KDLPROJECT_NAMES; do
        echo_info "   - Deleting \"$NAME\" kdlprojects finalizer..."
        kubectl -n ${NAMESPACE} patch kdlprojects $NAME --type json --patch='[ { "op": "remove", "path": "/metadata/finalizers" } ]'
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
