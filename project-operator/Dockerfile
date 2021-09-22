# Build the manager binary
FROM quay.io/operator-framework/helm-operator:v1.6.2

# Maintainer of the Dockerfile
LABEL maintainer="Intelygenz - Konstellation Team"

ENV HOME=/opt/helm
COPY watches.yaml ${HOME}/watches.yaml
COPY helm-charts  ${HOME}/helm-charts
WORKDIR ${HOME}
