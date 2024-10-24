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

  prepare_helm

  if [ "$BUILD_DOCKER_IMAGES" = "1" ]; then
    build_docker_images
  fi

  create_namespace

  if [ "$ENABLE_TLS" != "false" ]; then
    ./scripts/create_self_signed_cert.sh $NAMESPACE $DOMAIN $OS
  fi
  ./scripts/create_nginx_ingress_configmap.sh

  deploy_helm_chart
}

HELM_READY=""

prepare_helm() {
  if [ "$HELM_READY" = "1" ]; then
    return
  fi

  if [ "$HELM_VERSION" = "2" ]; then
    # Helm v2 needs to be initiated first
    echo_wait "Init helm v2..."
    run helm init --upgrade --wait
  fi

  HELM_READY=1
}

get_kubectl_dry_run() {
    act_version="$(kubectl version --client=true --short | sed 's/[^0-9.]*\([0-9.]*\).*/\1/')"
    req_version="1.18.0"

    # get the lowest version of the two compared
    lowest_version=$(printf '%s\n' "${act_version}" "${req_version}" | sort -V | head -n1)

    # if minimum required is met, use newer parameter
    if [ "$lowest_version" = "$req_version" ]; then
      echo "--dry-run=client"
      return
    fi

    echo "--dry-run"
}

create_namespace() {
  microk8s_kubeconfig

  DRY_RUN=$(get_kubectl_dry_run)
  echo_info "📚️ Create Namespace if not exist..."
  NS=$(kubectl create ns "${NAMESPACE}" ${DRY_RUN} -o yaml)
  if [ "$VERBOSE" = "1" ]; then
    # NOTE: there is no way to call run() with pipe commands
    echo_run "kubectl create ns \"${NAMESPACE}\" ${DRY_RUN} -o yaml | kubectl apply -f -"
    echo "$NS" | kubectl apply -f -
  else
    echo "$NS" | kubectl apply > /dev/null -f - 2>&1
  fi
}

deploy_helm_chart() {

  export KNOWLEDGE_GALAXY_IMAGE_REPOSITORY="konstellation/knowledge-galaxy"
  if [ "$KNOWLEDGE_GALAXY_LOCAL" = "true"  ]; then
    export KNOWLEDGE_GALAXY_IMAGE_REPOSITORY="$IMAGE_REGISTRY/konstellation/knowledge-galaxy"
    export KNOWLEDGE_GALAXY_IMAGE_TAG="latest"
    echo_info "LOCAL KG"
  fi
  if [ "$KUBECONFIG_ENABLED" = "true" ] || [ ! -z "$KUBECONFIG" ]; then
    export EXTERNAL_SERVER_URL=$(yq '.clusters[] | select (.name == "microk8s-cluster") | .cluster.server' ${KUBECONFIG})
    echo_info "KDL Remote Development enabled"
  fi
  echo_info "📦 Applying helm chart..."
  helmfile -f scripts/helmfile/helmfile.yaml deps
  helmfile -f scripts/helmfile/helmfile.yaml apply
}
