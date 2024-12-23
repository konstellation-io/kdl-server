#!/bin/bash

echo 'Go mod tidy all modules'

for f in $(find . -name go.mod)
do (
    cd $(dirname $f);
    echo 'Upgrading go dependencies for '$(dirname $f);
    rm go.sum;
    go mod tidy;
)
done
