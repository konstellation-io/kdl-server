#!/bin/sh

set -e
if [ "$DEBUG" = "1" ]; then
  set -x
fi

NAMESPACE="ingress"
CONFIGMAP_NAME="nginx-load-balancer-microk8s-conf"

echo "Creating Nginx ingress configmap for an ingress correct functionality"

cat << EOF | kubectl apply -f -
apiVersion: v1
data:
  annotation-value-word-blocklist: ·
kind: ConfigMap
metadata:
  name: $CONFIGMAP_NAME
  namespace: $NAMESPACE
EOF
