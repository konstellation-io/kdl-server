#!/bin/sh

cmd_login() {
  minikube_start
  local_login
}

show_login_help() {
  echo "$(help_global_header "login")

    $(help_global_options)
"
}

local_login() {
  # Open browser automatically
  LINK=https://kdlapp.kdl.$(minikube -p kdl-local ip).nip.io
  nohup xdg-open "$LINK" >/dev/null 2>&1 &
}
