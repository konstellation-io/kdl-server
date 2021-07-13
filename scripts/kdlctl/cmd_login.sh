#!/bin/sh

cmd_login() {
  microk8s_start
  local_login

  echo "👤 User    : ${GITEA_ADMIN_USER}"
  echo "🔑 Password: ${GITEA_ADMIN_PASSWORD}"
}

show_login_help() {
  echo "$(help_global_header "login")

    $(help_global_options)
"
}

local_login() {
  LINK=https://kdlapp.kdl.$(hostname -I | cut -d' ' -f1).nip.io
  echo "Login link: ${LINK}"

  if [ "$OS" = "Darwin" ]; then
    open "$LINK"
    exit 0
  fi

  # Open browser automatically
  nohup xdg-open "$LINK" >/dev/null 2>&1 &
}
