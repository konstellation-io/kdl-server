#!/bin/sh

set -e
if [ "$DEBUG" = "1" ]; then
  set -x
fi

NAMESPACE="ingress-nginx"
CONFIGMAP_NAME="ingress-nginx-controller"

echo "Patch ingress nginx configMap"
kubectl -n $NAMESPACE patch configmap $CONFIGMAP_NAME --patch '{"data": {"allow-snippet-annotations": "true"}}'
