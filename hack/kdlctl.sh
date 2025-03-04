#!/bin/sh

# disable unused vars check, vars are used on functions inside subscripts
# shellcheck disable=SC2034 # https://github.com/koalaman/shellcheck/wiki/SC2034

set -eu

DEBUG=${DEBUG:-0}

if [ "$DEBUG" = "1" ]; then
  set -x
fi

# Default values
VERBOSE=1
SKIP_BUILD=0
BUILD_ALL=1
BUILD_ENGINE=0
BUILD_RUNTIME=0
BUILD_RUNNERS=0
SKIP_FRONTEND_BUILD=0
SKIP_OPERATOR_BUILD=0
OPERATOR_SDK_INSTALLED=0
OS=$(uname)

. ./.kdlctl.conf
. ./scripts/kdlctl/common_functions.sh
. ./scripts/kdlctl/cmd_help.sh
. ./scripts/kdlctl/cmd_minikube.sh
. ./scripts/kdlctl/cmd_dev.sh
. ./scripts/kdlctl/cmd_build.sh
. ./scripts/kdlctl/cmd_usertools.sh
. ./scripts/kdlctl/cmd_deploy.sh
. ./scripts/kdlctl/cmd_restart.sh
. ./scripts/kdlctl/cmd_login.sh
. ./scripts/kdlctl/cmd_uninstall.sh

check_requirements

echo

# Parse global arguments
case $* in
*\ -q*)
  VERBOSE=0
  ;;
*--help | -h*)
  show_help "$@"
  exit
  ;;
esac

if [ -z "$*" ] || { [ "$VERBOSE" = "0" ] && [ "$#" = "1" ]; }; then
  echo_warning "missing command"
  echo
  echo
  show_help
  exit 1
fi

# Split command and sub-command args and remove global flags
COMMAND=$1
shift
COMMAND_ARGS=$(echo "$*" | sed -e 's/ +-v//g')

# Check which command is requested
case $COMMAND in
start)
  minikube_start "$@"
  echo_done "Start done"
  exit 0
  ;;

stop)
  minikube_stop
  echo_done "Stop done"
  exit 0
  ;;

dev)
  cmd_dev "$@"
  echo_done "Dev environment created"
  exit 0
  ;;

kdl)
  cmd_build_kdl "$@"
  echo_done "KDL server updated"
  exit 0
  ;;

login)
  cmd_login "$@"
  echo_done "Login done"
  exit 0
  ;;

deploy)
  cmd_deploy "$@"
  echo_done "Deploy done"
  exit 0
  ;;

usertools)
  cmd_usertools "$@"
  echo_done "Usertools done"
  exit 0
  ;;

build)
  cmd_build "$@"
  echo_done "Build done"
  exit 0
  ;;

restart)
  cmd_restart "$@"
  echo_done "Restart done"
  exit 0
  ;;

uninstall)
  cmd_uninstall "$@"
  echo_done "Uninstall done"
  exit 0
  ;;

*)
  echo_warning "unknown command: $(echo_yellow "$COMMAND")"
  echo
  echo
  show_help
  exit 1
  ;;

esac
