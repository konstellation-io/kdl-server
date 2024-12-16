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
  LINK=https://kdlapp.kdl.$HOST_IP.nip.io
  echo "Login link  : ${LINK}"
  echo "👤 User     : ${KEYCLOAK_DEFAULT_USER}"
  echo "🔑 Password : ${KEYCLOAK_DEFAULT_PASSWORD}"

  if [ "$OS" = "Darwin" ]; then
    open "$LINK"
    exit 0
  fi

  # Open browser automatically
  nohup xdg-open "$LINK" >/dev/null 2>&1 &
}
