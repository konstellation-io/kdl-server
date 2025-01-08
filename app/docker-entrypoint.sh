#!/bin/sh

# This script serves as the entrypoint for the Docker container, handling process
# management, signal forwarding, and logging.
#
# Functionality:
# * Signal handling: captures and forwards system signals (TERM/INT) to the main process
# * Logging: ensures all stdout/stderr outputs are logged both to console and file
# * Process management: maintains proper process lifecycle and exit codes
#
# How it works:
# * Uses 'set -e' to stop execution on any error
# * Traps system signals to ensure clean process termination
# * Combines stdout/stderr and sends to both console and log file
# * Waits for main process completion and forwards its exit code
#
# Usage:
#   The script expects the main application command as arguments
#   Example: ./docker-entrypoint.sh /app/kdl-server

set -e

# forward signals to the main process
trap 'kill -TERM $PID' TERM INT

# start the main process
"$@" 2>&1 | tee -a /var/log/app/app.log &
PID=$!

# wait for process to end
wait $PID
exit $?
