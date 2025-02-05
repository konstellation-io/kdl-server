minikube_hard_reset() {
  while true; do
    read -p "⚠️  Do you wish to delete the $MINIKUBE_PROFILE minikube profile? CAUTION: all data will be permanently deleted. 🔥" yn
    case $yn in
    [Yy]*)
      minikube delete -p "${MINIKUBE_PROFILE}"
      break
      ;;
    [Nn]*) exit ;;
    *) echo "Please answer y[yes] or n[no]." ;;
    esac
  done
}

MINIKUBE_CHECK=0
minikube_start() {
  if [ "$MINIKUBE_CHECK" = "1" ]; then
    return
  fi

  MINIKUBE_STATUS=$(minikube status -p "${MINIKUBE_PROFILE}" | grep apiserver | cut -d ' ' -f 2)

  case $MINIKUBE_STATUS in
  Running)
    echo_check "Minikube already running"
    ;;
  Stopped)
    echo_check "Restarting minikube profile"
    minikube start -p "${MINIKUBE_PROFILE}"
    ;;
  *)
    echo_wait "Creating new minikube profile"
    minikube start -p "${MINIKUBE_PROFILE}" \
      --namespace="${NAMESPACE}" \
      --cpus="${MINIKUBE_CPUS}" \
      --memory="${MINIKUBE_MEMORY}" \
      --kubernetes-version="${MINIKUBE_KUBERNETES_VERSION:-stable}" \
      --disk-size="${MINIKUBE_DISK_SIZE}" \
      --driver="${MINIKUBE_DRIVER:-docker}" \
      --container-runtime="${MINIKUBE_RUNTIME:-docker}" \
      --insecure-registry="${MINIKUBE_INSECURE_REGISTRY_CIDR}" \
      --addons="${MINIKUBE_ADDONS}" \
      --delete-on-failure=true \
      --interactive=false \
      --force || exit 1
    ;;
  esac

  minikube_profile_update

  MINIKUBE_CHECK=1
}

minikube_profile_update() {
  export KUBECONFIG=${HOME}/.kube/config-minikube
  chmod 600 ${KUBECONFIG}
  minikube profile "${MINIKUBE_PROFILE}" && minikube update-context
}

minikube_wait_for_registry() {
  echo_info "⚙️ Waiting for Docker registry..."
  until [ $(curl -w %{http_code} -s -o /dev/null ${DOCKER_REGISTRY_HOST}) = "200" ]; do
    printf "."
    sleep 5
  done
}

get_admin_api_pod() {
  kubectl -n ${NAMESPACE} get pod -l app.kubernetes.io/name=kdl-server -o custom-columns=":metadata.name" --no-headers
}

get_mongo_pod() {
  kubectl -n ${NAMESPACE} get pod -l app=mongodb-database-svc -o custom-columns=":metadata.name" --no-headers
}

minikube_stop() {
  minikube -p "${MINIKUBE_PROFILE}" stop
}

minikube_clean() {
  eval "$(minikube docker-env -p "${MINIKUBE_PROFILE}")"
  KEEP_THRESHOLD_HOURS="12"
  # Clean unused containers and images inside minikube
  echo_wait "Clean unused containers and images inside minikube"
  docker run --rm -it \
    -v /var/run/docker.sock:/var/run/docker.sock docker:stable \
    /bin/sh -c "docker system prune --filter \"until=${KEEP_THRESHOLD_HOURS}h\" -f"

  unset DOCKER_TLS_VERIFY DOCKER_HOST DOCKER_CERT_PATH MINIKUBE_ACTIVE_DOCKERD
}
