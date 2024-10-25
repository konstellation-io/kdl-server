#!/bin/sh

refresh_certs(){
  sudo microk8s refresh-certs -e ca.crt
  sudo microk8s refresh-certs -e server.crt
  sudo microk8s refresh-certs -e front-proxy-client.crt
}