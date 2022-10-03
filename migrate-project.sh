#!/bin/bash
NAMESPACE=kdl
RELEASE_NAME=kdl-local

cat << EOF > patch-file.yaml
spec:
  minio:
    endpointURL: http://${RELEASE_NAME}-minio:9000
EOF

for project in $(kubectl -n ${NAMESPACE} get kdlprojects.project.konstellation.io -o name); do kubectl -n ${NAMESPACE} patch ${project} --type merge --patch-file patch-file.yaml; done
rm -f patch-file.yaml
