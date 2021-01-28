#!/bin/sh

script_name=$(basename "$0")

show_help() {
  case $* in
    *dev*)
      show_dev_help
    ;;
    *etchost*)
      show_etchost_help
    ;;
    *login*)
      show_login_help
    ;;
    *build*)
      show_build_help
    ;;
    *deploy*)
      show_deploy_help
    ;;
    *delete*)
      show_delete_help
    ;;
    *restart*)
      show_restart_help
    ;;
    *)
      show_root_help
    ;;
  esac
}

help_global_header() {
  cmd=${1:-"<command>"}

  echo "  $(echo_green "${script_name}") -- a tool to manage KDL environment during development.

  syntax: $(echo_yellow "${script_name} ${cmd} [options]")"
}

help_global_options() {
  echo "global options:
      h     prints this help.
      q     silent mode.
 "
}

show_root_help() {
   echo "$(help_global_header "")

    commands:
      dev     creates a complete local environment.
      start   starts minikube kdl profile.
      stop    stops minikube kdl profile.
      build   calls docker to build all images inside minikube.
      deploy  calls helm to create install/upgrade a kdl release on minikube.
      restart restarts kdl or versions, useful after build command.
      etchost updates /etc/hosts with minikube IP for all kdl domains. (needs hostctl binary and it will ask for sudo password)

    $(help_global_options)
"
}
