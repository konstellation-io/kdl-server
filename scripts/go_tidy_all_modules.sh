#!/bin/bash

echo 'Go mod tidy all modules'

echo 'Upgrading go dependencies for app/api'
cd app/api
go mod tidy

echo 'Upgrading go dependencies for cleaner'
cd ../../cleaner
go mod tidy

echo 'Upgrading go dependencies for gitea-oauth2-setup'
cd ../gitea-oauth2-setup
go mod tidy

echo 'Upgrading go dependencies for repo-cloner'
cd ../repo-cloner
go mod tidy