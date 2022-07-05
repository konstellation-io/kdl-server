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

  KNOWLEDGE_GALAXY_IMAGE_REPOSITORY="konstellation/knowledge-galaxy"
  SET_KNOWLEDGE_GALAXY_IMAGE_TAG=""
  if [ "$KNOWLEDGE_GALAXY_LOCAL" = "true"  ]; then
    KNOWLEDGE_GALAXY_IMAGE_REPOSITORY="$IMAGE_REGISTRY/konstellation/knowledge-galaxy"
    SET_KNOWLEDGE_GALAXY_IMAGE_TAG="--set knowledgeGalaxy.image.tag=latest"
    echo_info "LOCAL KG"
  fi

  echo_info "📦 Applying helm chart..."
  run helm dep update helm/kdl-server
  run helm upgrade \
    --install "${RELEASE_NAME}" \
    --namespace "${NAMESPACE}" \
    --set backup.enabled="false" \
    --set backup.image.pullPolicy="Always" \
    --set backup.image.repository="${IMAGE_REGISTRY}/konstellation/kdl-backup" \
    --set backup.image.tag="latest" \
    --set domain="${DOMAIN}" \
    --set drone.storage.storageClassName="${STORAGE_CLASS_NAME}" \
    --set droneAuthorizer.image.pullPolicy="Always" \
    --set droneAuthorizer.image.repository="${IMAGE_REGISTRY}/konstellation/drone-authorizer" \
    --set droneAuthorizer.image.tag="latest" \
    --set droneRunner.droneRunnerEnviron="GIT_SSL_NO_VERIFY:true" \
    --set gitea.admin.password="${GITEA_ADMIN_PASSWORD}" \
    --set gitea.admin.username="${GITEA_ADMIN_USER}" \
    --set gitea.storage.storageClassName="${STORAGE_CLASS_NAME}" \
    --set giteaOauth2Setup.image.pullPolicy="Always" \
    --set giteaOauth2Setup.image.repository="${IMAGE_REGISTRY}/konstellation/gitea-oauth2-setup" \
    --set giteaOauth2Setup.image.tag="latest" \
    --set kdlServer.image.pullPolicy="Always" \
    --set kdlServer.image.tag="latest" \
    --set kdlServer.image.repository="${IMAGE_REGISTRY}/konstellation/kdl-server" \
    --set knowledgeGalaxy.image.pullPolicy="Always" \
    --set knowledgeGalaxy.image.repository="${KNOWLEDGE_GALAXY_IMAGE_REPOSITORY}" \
    "${SET_KNOWLEDGE_GALAXY_IMAGE_TAG}" \
    --set minio.securityContext.runAsUser=0 \
    --set mongodb.persistentVolume.storageClassName="${STORAGE_CLASS_NAME}" \
    --set sharedVolume.storageClassName="${STORAGE_CLASS_NAME}" \
    --set postgres.storage.storageClassName="${STORAGE_CLASS_NAME}" \
    --set projectOperator.manager.image.pullPolicy="Always" \
    --set projectOperator.manager.image.repository="${IMAGE_REGISTRY}/konstellation/project-operator" \
    --set projectOperator.manager.image.tag="latest" \
    --set projectOperator.mlflow.image.pullPolicy="Always" \
    --set projectOperator.mlflow.image.repository="${IMAGE_REGISTRY}/konstellation/mlflow" \
    --set projectOperator.mlflow.image.tag="latest" \
    --set projectOperator.mlflow.volume.storageClassName="${STORAGE_CLASS_NAME}" \
    --set tls.enabled="${ENABLE_TLS}" \
    --set tls.secretName="${DOMAIN}-tls-secret" \
    --set tls.caSecret.name=mkcert-ca \
    --set tls.caSecret.certFilename=mkcert-ca.crt \
    --set userToolsOperator.image.pullPolicy="Always" \
    --set userToolsOperator.image.repository="${IMAGE_REGISTRY}/konstellation/user-tools-operator" \
    --set userToolsOperator.image.tag="latest" \
    --set userToolsOperator.jupyter.image.pullPolicy="Always" \
    --set userToolsOperator.jupyter.image.repository="$IMAGE_REGISTRY/konstellation/jupyter-gpu" \
    --set userToolsOperator.jupyter.image.tag="latest" \
    --set enterprise-gateway.kernelspecs.imagePullPolicy="Always" \
    --set enterprise-gateway.kernelspecs.image="$IMAGE_REGISTRY/konstellation/jupyter-kernelspecs:latest" \
    --set userToolsOperator.repoCloner.image.pullPolicy="Always" \
    --set userToolsOperator.repoCloner.image.repository="${IMAGE_REGISTRY}/konstellation/repo-cloner" \
    --set userToolsOperator.repoCloner.image.tag="latest" \
    --set userToolsOperator.vscode.image.pullPolicy="Always" \
    --set userToolsOperator.vscode.image.repository="${IMAGE_REGISTRY}/konstellation/vscode" \
    --set userToolsOperator.vscode.image.tag="latest" \
    --set userToolsOperator.storage.storageClassName="${STORAGE_CLASS_NAME}" \
    --set userToolsOperator.kubeconfig.enabled="true" \
    --set userToolsOperator.kubeconfig.externalServerUrl="https://192.168.0.21:16443" \
    --timeout 60m \
    --wait \
    helm/kdl-server
}
