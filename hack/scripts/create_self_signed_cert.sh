#!/bin/sh

set -e
if [ "$DEBUG" = "1" ]; then
  set -x
fi

NAMESPACE=$1
DOMAIN=$2
OS=$3

if [ -z "$NAMESPACE" ] || [ -z "$DEPLOY_NAME" ]; then
  echo "Variables NAMESPACE and DOMAIN is required"
  exit 1
fi

echo "Creating self-signed CA certificates for TLS and installing them in the local trust stores"
CA_CERTS_FOLDER=.certs/toolkit
rm -rf ${CA_CERTS_FOLDER}/toolkit
mkdir -p ${CA_CERTS_FOLDER}

if [ "$OS" = "Darwin" ]; then
  brew install mkcert
  brew install nss
  mkcert -install
  TRUST_STORES=nss mkcert --install  *.$DOMAIN
  mv _wildcard.* .certs/toolkit
  echo "Creating K8S secrets with the CA private keys"
  kubectl -n $NAMESPACE create secret tls $DOMAIN-tls-secret --key=$CA_CERTS_FOLDER/_wildcard.$DOMAIN-key.pem --cert=$CA_CERTS_FOLDER/_wildcard.$DOMAIN.pem --dry-run -o yaml | kubectl apply -f -
  kubectl -n $NAMESPACE create secret generic mkcert-ca --from-file=mkcert-ca.crt=${HOME}/Library/Application\ Support/mkcert/rootCA.pem --dry-run -o yaml | kubectl apply -f -
  exit 0
fi

if [ -x .certs/mkcert ]; then
  echo "mkcert is installed"
else
  wget https://github.com/FiloSottile/mkcert/releases/download/v1.4.1/mkcert-v1.4.1-linux-amd64
  mv mkcert-v1.4.1-linux-amd64 .certs/mkcert
  chmod +x .certs/mkcert
fi

TRUST_STORES=nss .certs/mkcert --install  *.$DOMAIN
mv _wildcard.* .certs/toolkit


if [ ! -z ${XDG_DATA_HOME} ]; then
    CA_FILE=${XDG_DATA_HOME}/mkcert/rootCA.pem
else
    CA_FILE=${HOME}/.local/share/mkcert/rootCA.pem
fi

echo "Creating K8S secrets with the CA private keys"
kubectl -n $NAMESPACE create secret tls $DOMAIN-tls-secret --key=$CA_CERTS_FOLDER/_wildcard.$DOMAIN-key.pem --cert=$CA_CERTS_FOLDER/_wildcard.$DOMAIN.pem --dry-run=client -o yaml | kubectl apply -f -
kubectl -n $NAMESPACE create secret generic mkcert-ca --from-file=mkcert-ca.crt=${CA_FILE} --dry-run=client -o yaml | kubectl apply -f -