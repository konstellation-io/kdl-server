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
    --set drone.storage.storageClassName=$STORAGE_CLASS_NAME \
    --set droneAuthorizer.image.pullPolicy="Always" \
    --set droneAuthorizer.image.repository="$IMAGE_REGISTRY/konstellation/drone-authorizer" \
    --set gitea.admin.password=${GITEA_ADMIN_PASSWORD} \
    --set gitea.admin.username="$GITEA_ADMIN_USER" \
    --set gitea.storage.storageClassName=$STORAGE_CLASS_NAME \
    --set giteaOauth2Setup.image.pullPolicy="Always" \
    --set giteaOauth2Setup.image.repository="$IMAGE_REGISTRY/konstellation/gitea-oauth2-setup" \
    --set kdl.local="true" \
    --set kdlServer.image.pullPolicy="Always" \
    --set kdlServer.image.repository="$IMAGE_REGISTRY/konstellation/kdl-server" \
    --set minio.securityContext.runAsUser=0 \
    --set mongodb.persistentVolume.storageClassName=$STORAGE_CLASS_NAME \
    --set sharedVolume.storageClassName=$STORAGE_CLASS_NAME \
    --set postgres.storage.storageClassName=$STORAGE_CLASS_NAME \
    --set projectOperator.image.pullPolicy="Always" \
    --set projectOperator.image.repository="$IMAGE_REGISTRY/konstellation/project-operator" \
    --set projectOperator.mlflow.image.pullPolicy="Always" \
    --set projectOperator.mlflow.image.repository="$IMAGE_REGISTRY/konstellation/mlflow" \
    --set projectOperator.mlflow.volume.storageClassName=$STORAGE_CLASS_NAME \
    --set userToolsOperator.image.pullPolicy="Always" \
    --set userToolsOperator.image.repository="$IMAGE_REGISTRY/konstellation/user-tools-operator" \
    --set userToolsOperator.jupyter.image.pullPolicy="Always" \
    --set userToolsOperator.jupyter.image.repository="$IMAGE_REGISTRY/konstellation/jupyter-gpu" \
    --set userToolsOperator.repoCloner.image.pullPolicy="Always" \
    --set userToolsOperator.repoCloner.image.repository="$IMAGE_REGISTRY/konstellation/repo-cloner" \
    --set userToolsOperator.vscode.image.pullPolicy="Always" \
    --set userToolsOperator.vscode.image.repository="$IMAGE_REGISTRY/konstellation/vscode" \
    --timeout 60m \
    --wait \
    helm/kdl-server
}
