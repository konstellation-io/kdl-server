#!/bin/sh

script_name=$(basename "$0")

show_help() {
  case $* in
  *dev*)
    show_dev_help
    ;;
  *kdl*)
    show_build_kdl_help
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
  *usertools*)
    show_usertools_help
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
      dev           creates a complete local environment.
      kdl           build and upload KDL server image.
      start         starts minikube.
      stop          stops minikube.
      build         calls docker to build all images and push them to minikube registry.
      deploy        calls helm to create install/upgrade a kdl release on minikube.
      restart       restarts kdl pods or minikube useful after build command.
      uninstall     remove all resources from minikube.

    $(help_global_options)
"
}
