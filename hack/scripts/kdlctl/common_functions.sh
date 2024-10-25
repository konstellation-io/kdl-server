#!/bin/sh

# Supress warning for echo functions
# shellcheck disable=SC2028 # https://github.com/koalaman/shellcheck/wiki/SC2028
# shellcheck disable=SC2034 # https://github.com/koalaman/shellcheck/wiki/SC2034

run() {
  set -e
  # shellcheck disable=SC2048
  if [ "$VERBOSE" = "1" ]; then
    echo_run "$*"
    $*
  else
    $* > /dev/null 2>&1
  fi
}

check_requirements() {
  check_so

  REQUIREMENTS_OK=1

  MICROK8S_INSTALLED=$(cmd_installed microk8s)
  [ "$MICROK8S_INSTALLED" = "1" ] || { REQUIREMENTS_OK=0 && echo_warning "Missing microk8s installation"; }

  if [ "${OS}" = "Darwin" ]; then
    JQ_INSTALLED=$(cmd_installed jq)
    if [ "$JQ_INSTALLED" = "1" ]; then
      docker_daemon_file="${HOME}/.docker/daemon.json"
      modified_daemon_file=$(jq --arg ip "$HOST_IP:32000" '
        if has("insecure-registries") then
          if all(."insecure-registries"[] != $ip; .) then
            ."insecure-registries" += [$ip]
          else
            .
          end
        else
          . + {"insecure-registries":[$ip]}
        end' "$docker_daemon_file")

      echo "$modified_daemon_file" > "$docker_daemon_file"
    else
     REQUIREMENTS_OK=0 && echo_warning "Missing jq installation";
    fi
  fi

  case ${OS} in
    "Linux")
      MICROK8S_INFO=$(snap info microk8s)
      ;;

    "Darwin")
      check_requirements_mac
      MICROK8S_INFO=$(multipass exec microk8s-vm -- snap info microk8s)
      ;;
  esac

  MICROK8S_VERSION=$(echo "${MICROK8S_INFO}" | grep installed | awk '{print $2}')
  MICROK8S_VERSION_MAJOR=$(echo "${MICROK8S_VERSION}" | cut -d '.' -f 1)
  MICROK8S_VERSION_MINOR=$(echo "${MICROK8S_VERSION}" | cut -d '.' -f 2)

  [ "$MICROK8S_VERSION_MAJOR" = "v1" ] || { REQUIREMENTS_OK=0 && echo "Required version 1.23.+ of microk8s"; }
  [ "$MICROK8S_VERSION_MINOR" -ge "23" ] || { REQUIREMENTS_OK=0 && echo "Required version 1.23.+ of microk8s"; }

  ENVSUBT_INSTALLED=$(cmd_installed envsubst)
  [ "$ENVSUBT_INSTALLED" = "1" ] || { REQUIREMENTS_OK=0 && echo_warning "Missing gettext installation"; }

  DOCKER_INSTALLED=$(cmd_installed docker)
  [ "$DOCKER_INSTALLED" = "1" ] || { REQUIREMENTS_OK=0 && echo_warning "Missing docker command"; }

  KUBECTL_INSTALLED=$(cmd_installed kubectl)
  [ "$KUBECTL_INSTALLED" = "1" ] || { REQUIREMENTS_OK=0 && echo_warning "Missing kubectl command"; }

  HELM_INSTALLED=$(cmd_installed helm)
  [ "$HELM_INSTALLED" = "1" ] || { REQUIREMENTS_OK=0 && echo_warning "Missing helm command"; }

  CURL_INSTALLED=$(cmd_installed curl)
  [ "$CURL_INSTALLED" = "1" ] || { REQUIREMENTS_OK=0 && echo_warning "Missing curl command"; }

  if [ "$REQUIREMENTS_OK" = "0" ]; then
    exit 1
  fi
}

check_so() {
  if [ "$OS" != "Linux" ] && [ "$OS" != "Darwin" ]; then
    echo_warning "Error: ${OS} SO is not supported"
    exit 1
  fi
}

check_requirements_mac() {
  MICROK8S_VM_INSTALLED=$(multipass list | { grep microk8s-vm || true; })
  if [ -z "$MICROK8S_VM_INSTALLED" ]; then
    microk8s_install_vm
  fi
}

cmd_installed() {
  if command -v "$1" >/dev/null 2>&1; then
    echo 1
  else
    echo 0
  fi
}

check_not_empty() {
  VARNAME=$1
  ERR=${2:-"Missing variable $VARNAME"}
  # shellcheck disable=SC1083
  eval VALUE=\${"$VARNAME"}

  # If value is empty exit execution
  [ "$VALUE" != "" ] || { echo_fatal "$ERR" && exit 1; }

  return 0
}


## Print lines helpers (NO DIRECT COLORING, call echo_<color> instead)
echo_run() {
  echo_info "  🏃 $*"
}

echo_warning() {
  echo "⚠️️  $(echo_yellow "$*") ⚠️️"
}

echo_fatal() {
  echo "⚠️️  $(echo_red "$*")"
  exit 1
}

echo_wait() {
  echo "⏳ $*"
}

echo_info() {
  echo_yellow "$*"
}

echo_check() {
  echo_light_green "✔ $*"
}

echo_done() {
  MSG=${1:-"Done"}
  echo
  echo_green "✔ ${MSG}."
  echo
}

echo_debug() {
  if [ "$DEBUG" = "1" ]; then
      echo "$* $*\n" "$(echo_red "[DEBUG]")" "$@"
  fi
}

# Coloring echo strings (NO NEW LINES HERE, use helpers instead)

echo_red() {
  echo "\033[31m$*\033[m\n"
}

echo_green() {
  echo "\033[92m$*\033[m"
}

echo_light_green() {
  echo "\033[32m$*\033[m"
}

echo_yellow() {
  echo "\033[33m$*\033[m"
}

echo_red() {
  echo "\033[31m$*\033[m"
}
