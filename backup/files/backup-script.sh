#!/bin/bash

DATE=$(date +%Y%m%d)
mkdir -p /backup/{gitea,mongodb,mlflow,kubernetes}

# Gitea backup
function gitea_backup () {
    echo "${DB_HOST}:${POSTGRES_DB}:${DB_USER}:${POSTGRES_PASSWORD}" > ~/.pgpass
    chmod 600 ~/.pgpass
    tar zcvf /backup/gitea/data.tar.gz --directory '/data' --exclude './gitea/indexers' .
    pg_dump -h "$(echo ${DB_HOST} | cut -f 1 -d ":" )" -p "$(echo ${DB_HOST} | cut -f 2 -d ":" )" -U "${DB_USER}" -v -F c -f /backup/gitea/postgres_gitea.dump "${POSTGRES_DB}"
}

# MongoDB backup
function mongobackup () {
    mongodump --host "${MONGO_HOST}" --port "${MONGO_PORT}" --username "${MONGO_INITDB_ROOT_USERNAME}" --password "${MONGO_INITDB_ROOT_PASSWORD}" --out /backup/mongodb
}

# MLFlow backup
function mlflow_backup () {
    for i in /shared-volume/*/mlflow.db; do
        path="/backup/mlflow/";
        cp --preserve -R "${i%%mlflow.db}" "${path}"; done
}

# Kubernetes CR and Secrets backup
function kubernetes_backup () {
    kubectl --token "$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)" get secrets -n kdl | \
        awk '/ssh-keys/{print $1}' | \
        xargs kubectl --token "$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)" get secrets -n kdl -o yaml > /backup/kubernetes/ssh-secrets.yaml
    kubectl --token "$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)" get kdlprojects -n kdl -o yaml > /backup/kubernetes/crds.yaml 
}

echo "Performing GITEA backup..."
gitea_backup

echo "Performing MONGO backup..."
mongobackup

if [ -d "/shared-storage/" ]; then
    echo "Performing MLFLOW backup..."
    mlflow_backup
fi

echo "Performing KUBERNETES backup..."
kubernetes_backup

# Compress backup
echo "Compressing backup..."
tar zcvf "${HOME}/backup.tar.gz" /backup

# Send to AWS S3
echo "Sending backup to AWS S3..."    
aws s3 cp "${HOME}/backup.tar.gz" "s3://${BUCKET_NAME}/backup_${DATE}.tar.gz"
