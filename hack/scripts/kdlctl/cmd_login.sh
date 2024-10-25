#!/bin/sh

cmd_login() {
  local_login
}

show_login_help() {
  echo "$(help_global_header "login")

    $(help_global_options)
"
}

local_login() {
  if [ "$ENABLE_TLS" = "true" ];
  then
    export SCHEMA="https"
  else
    export SCHEMA="http"
  fi
  LINK=$SCHEMA://kdlapp.kdl.$HOST_IP.nip.io
  echo "Login link  : ${LINK}"
  echo "👤 User     : ${GITEA_ADMIN_USER}"
  echo "🔑 Password : ${GITEA_ADMIN_PASSWORD}"

  if [ "$OS" = "Darwin" ]; then
    open "$LINK"
    exit 0
  fi

  # Open browser automatically
  nohup xdg-open "$LINK" >/dev/null 2>&1 &
}
