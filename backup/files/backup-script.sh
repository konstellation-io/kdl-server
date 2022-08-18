#!/bin/bash

set -xeou pipefail

DATE=$(date +%Y%m%d)
mkdir -p /backup/{gitea,mongodb,mlflow,kubernetes}
mkdir -p /backup/gitea/data

# Gitea backup
function gitea_backup (){
    # Backup postgresql database
    echo "${DB_HOST}:${POSTGRES_DB}:${DB_USER}:${POSTGRES_PASSWORD}" > ~/.pgpass
    echo "${DB_HOST}:drone:${DB_USER}:${POSTGRES_PASSWORD}" >> ~/.pgpass
    chmod 600 ~/.pgpass
    pg_dump -h "$(echo ${DB_HOST} | cut -f 1 -d ":" )" -p "$(echo "${DB_HOST}" | cut -f 2 -d ":" )" -U "${DB_USER}" -v -F c -f /backup/gitea/postgres_gitea.dump "${POSTGRES_DB}"
    pg_dump -h "$(echo ${DB_HOST} | cut -f 1 -d ":" )" -p "$(echo "${DB_HOST}" | cut -f 2 -d ":" )" -U "${DB_USER}" -v -F c -f /backup/gitea/postgres_drone.dump drone

    # Backup gitea data
    rsync -a --progress /data/ /backup/gitea/data/ \
        --exclude 'gitea/indexers' \
        --exclude 'ssh' --exclude 'lost+found'
}
# MongoDB backup
function mongobackup () {
    mongodump --host "${MONGO_HOST}" --port "${MONGO_PORT}" --username "${MONGO_INITDB_ROOT_USERNAME}" --password "${MONGO_INITDB_ROOT_PASSWORD}" --out /backup/mongodb
}
# MLFlow backup
function mlflow_backup (){
    for i in /shared-volume/*/mlflow.db; do
        path="/backup/mlflow/";
        cp --preserve -R "${i%%mlflow.db}" "${path}"; done
}

# Kubernetes CR and Secrets backup
function kubernetes_backup (){
    kubectl --token "$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)" get secrets -n kdl | \
        awk '/ssh-keys/{print $1}' | \
        xargs kubectl --token "$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)" get secrets -n kdl -o yaml > /backup/kubernetes/ssh-secrets.yaml
    kubectl --token "$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)" get kdlprojects -n kdl -o yaml > /backup/kubernetes/kdlprojects.yaml
}

echo "Performing GITEA backup..."
gitea_backup

echo "Performing MONGO backup..."
mongobackup

if [ -d "/shared-volume/" ]; then
    echo "Performing MLFLOW backup..."
    mlflow_backup
fi

echo "Performing KUBERNETES backup..."
kubernetes_backup

# Compress and send to AWS
echo "Compressing backup..."
tar zcvf "${HOME}/backup.tar.gz" /backup
echo "Sending backup..."
aws s3 cp "${HOME}/backup.tar.gz" "s3://${BUCKET_NAME}/backup_${DATE}.tar.gz"

# Cleanup
echo "Cleaning up..."
rm -rf /backup/*
