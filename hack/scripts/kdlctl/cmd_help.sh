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
      start         starts microk8s.
      stop          stops microk8s.
      build         calls docker to build all images and push them to microk8s registry.
      deploy        calls helm to create install/upgrade a kdl release on microk8s.
      restart       restarts kdl pods or microk8s useful after build command.
      refresh-certs refresh microk8s local x509 certificates
                    (ca.cert, server.crt, front-proxy-client.crt)
                    after this operation you must execute kdlctl.sh deploy.

      uninstall     remove all resources from microk8s.

    $(help_global_options)
"
}
