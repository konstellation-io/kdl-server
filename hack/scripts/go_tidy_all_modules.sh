#!/bin/bash

echo 'Go mod tidy all modules'

echo 'Upgrading go dependencies for app/api'
cd app/api
rm go.sum
go mod tidy

echo 'Upgrading go dependencies for cleaner'
cd ../../cleaner
rm go.sum
go mod tidy

echo 'Upgrading go dependencies for gitea-oauth2-setup'
cd ../gitea-oauth2-setup
rm go.sum
go mod tidy

echo 'Upgrading go dependencies for repo-cloner'
cd ../repo-cloner
rm go.sum
go mod tidy