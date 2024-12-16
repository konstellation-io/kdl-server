#!/bin/sh

BUILD_DOCKER_IMAGES=0
cmd_deploy() {
  microk8s_start "$@"

  case $* in
    --build)
      BUILD_DOCKER_IMAGES=1
    ;;
  esac

  deploy
}

show_deploy_help() {
  echo "$(help_global_header "deploy")

    options:
      --build  re-build all docker images before deploying on microk8s.
      --gpu enables the GPU in MicroK8s

    $(help_global_options)
"
}

deploy() {
  export DOMAIN=kdl.$HOST_IP.nip.io

  if [ "$BUILD_DOCKER_IMAGES" = "1" ]; then
    build_docker_images
  fi

  ./scripts/create_nginx_ingress_configmap.sh

  deploy_helm_chart
}

get_kubectl_dry_run() {
    act_version="$(kubectl version --client=true | sed 's/[^0-9.]*\([0-9.]*\).*/\1/' | head -1)"
    req_version="1.30.0"

    # get the lowest version of the two compared
    lowest_version=$(printf '%s\n' "${act_version}" "${req_version}" | sort -V | head -n1)

    # if minimum required is met, use newer parameter
    if [ "$lowest_version" = "$req_version" ]; then
      echo "--dry-run=client"
      return
    fi

    echo "--dry-run"
}

deploy_helm_chart() {
  microk8s_kubeconfig

  export KNOWLEDGE_GALAXY_IMAGE_REPOSITORY="konstellation/knowledge-galaxy"
  if [ "$KNOWLEDGE_GALAXY_LOCAL" = "true"  ]; then
    export KNOWLEDGE_GALAXY_IMAGE_REPOSITORY="$IMAGE_REGISTRY/konstellation/kdl-knowledge-galaxy"
    export KNOWLEDGE_GALAXY_IMAGE_TAG="latest"
    echo_info "LOCAL KG"
  fi
  if [ "$KUBECONFIG_ENABLED" = "true" ] || [ ! -z "$KUBECONFIG" ]; then
    export EXTERNAL_SERVER_URL=$(yq eval '.clusters[] | select (.name == "microk8s-cluster") | .cluster.server' ${KUBECONFIG})
    echo_info "KDL Remote Development enabled"
  fi
  echo_info "📦 Applying helm chart..."
  helmfile -f scripts/helmfile/helmfile.yaml deps
  helmfile -f scripts/helmfile/helmfile.yaml apply
}
