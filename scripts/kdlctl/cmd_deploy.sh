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

  replace_env_vars
  create_namespace

  if [ "$ENABLE_TLS" != "false" ]; then
    ./scripts/create_self_signed_cert.sh $NAMESPACE $DOMAIN $OS
  fi

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
  echo_info "📦 Applying helm chart..."
  run helm dep update helm/kdl-server
  run helm upgrade \
    --install "${RELEASE_NAME}" \
    --namespace "${NAMESPACE}" \
    --set domain=$DOMAIN \
    --set droneAuthorizer.image.pullPolicy="Always" \
    --set droneAuthorizer.image.repository="$IMAGE_REGISTRY/konstellation/drone-authorizer" \
    --set kdlServer.image.pullPolicy="Always" \
    --set kdlServer.image.repository="$IMAGE_REGISTRY/konstellation/kdl-server" \
    --set mlflow.image.pullPolicy="Always" \
    --set mlflow.image.repository="$IMAGE_REGISTRY/konstellation/mlflow" \
    --set mlflow.volume.storageClassName=$STORAGE_CLASS_NAME \
    --set mongodb.persistentVolume.storageClassName=$STORAGE_CLASS_NAME \
    --set projectOperator.image.pullPolicy="Always" \
    --set projectOperator.image.repository="$IMAGE_REGISTRY/konstellation/project-operator" \
    --set science-toolkit.kdl.local="true" \
    --set science-toolkit.domain=$DOMAIN \
    --set science-toolkit.drone.storage.storageClassName=$STORAGE_CLASS_NAME \
    --set science-toolkit.gitea.admin.password=$GITEA_ADMIN_PASSWORD \
    --set science-toolkit.gitea.admin.username=$GITEA_ADMIN_USER \
    --set science-toolkit.gitea.storage.storageClassName=$STORAGE_CLASS_NAME \
    --set science-toolkit.minio.securityContext.runAsUser=0 \
    --set science-toolkit.postgres.storage.storageClassName=$STORAGE_CLASS_NAME \
    --set science-toolkit.tls.enabled=$ENABLE_TLS \
    --set science-toolkit.sharedVolume.storageClassName=$STORAGE_CLASS_NAME \
    --set science-toolkit.vscode.storage.storageClassName=$STORAGE_CLASS_NAME \
    --set userToolsOperator.image.pullPolicy="Always" \
    --set userToolsOperator.image.repository="$IMAGE_REGISTRY/konstellation/user-tools-operator" \
    --timeout 60m \
    --wait \
    helm/kdl-server
}
