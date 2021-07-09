
# minikube_hard_reset() {
#   while true; do
#     read -p "⚠️  Do you wish to delete the $MINIKUBE_PROFILE minikube profile? CAUTION: all data will be permanently deleted. 🔥" yn
#     case $yn in
#     [Yy]*)
#       dracarys_header && minikube delete -p "$MINIKUBE_PROFILE"
#       break
#       ;;
#     [Nn]*) exit ;;
#     *) echo "Please answer y[yes] or n[no]." ;;
#     esac
#   done
# }

MICROK8S_CHECK=0
microk8s_start() {
  # if [ "$MICROK8S_CHECK" = "1" ]; then
  #   return
  # fi

  # MICROK8S_STATUS=$(microk8s.status | head -1 | cut -d " " -f3)

  # case $MICROK8S_STATUS in
  #   running)
  #     echo_check "Minikube already running"
  #   ;;
  #   *)
  #     echo_check "Restarting minikube profile"
  #     microk8s.start
  #     microk8s.config > ~/.kube/config-microk8s
  #     export KUBECONFIG=~/.kube/config-microk8s
  #   ;;
  # esac
  # MICROK8S_CHECK=1

  microk8s.start
  microk8s.enable dns storage gpu ingress
  microk8s.config > ${HOME}/.kube/config-microk8s
  export KUBECONFIG=${HOME}/.kube/config-microk8s
}

# get_admin_api_pod() {
#   kubectl -n ${NAMESPACE} get pod -l app=${RELEASE_NAME}-kdl-server -o custom-columns=":metadata.name" --no-headers
# }

# get_mongo_pod() {
#   kubectl -n ${NAMESPACE} get pod -l app=${NAMESPACE}-mongo -o custom-columns=":metadata.name" --no-headers
# }

# minikube_stop() {
#   minikube -p "$MINIKUBE_PROFILE" stop
# }

# minikube_clean() {
#   eval "$(minikube docker-env -p "$MINIKUBE_PROFILE")"
#   KEEP_THRESHOLD_HOURS="12"
#   # Clean unused containers and images inside minikube
#   echo_wait "Clean unused containers and images inside minikube"
#   docker run --rm -it \
#     -v /var/run/docker.sock:/var/run/docker.sock docker:stable \
#     /bin/sh -c "docker system prune --filter \"until=${KEEP_THRESHOLD_HOURS}h\" -f"

#   unset DOCKER_TLS_VERIFY DOCKER_HOST DOCKER_CERT_PATH MINIKUBE_ACTIVE_DOCKERD
# }

dracarys_header() {
  echo "          ____ __"
  echo "         { --.\  |          .)%%%)%%"
  echo "          '-._\\ | (\___   %)%%(%%(%%%"
  echo '🔥DRACARYS🔥  `\\|{/ ^ _)-%(%%%%)%%;%%%'
  echo "          .'^^^^^^^  /\`    %%)%%%%)%%%'"
  echo "         //\   ) ,  /       '%%%%(%%'"
  echo "   ,  _.'/  \`\<-- \<"
  echo "    \`^^^\`     ^^   ^^"
}
