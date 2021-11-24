# KDL backup

This tool performs backup of KDL internal components and uploads it to AWS S3 as a Kubernetes Cronjob.

The components to be backup are:

- Gitea: backup of internal Postgres database
- MongoDB: backup of kdl and admin database
- MLFLow: backup per each project, database
- CustomResource and SSH secrets generated on runtime by the app


## An important note on MLFlow and Kubernetes API objects

Due to the fact that that Kubernetes API objects are created on runtime, there's no easy way to backup them. To guarantee that a disaster recovery plan can be performed on production, we recommend the main storage to be mounted, ensuring enough security flags are considered and implemented.

Also, it's important to note that MLFlow stores its data in a hostPath, so if you're using a Cloud Provider managed Kubernetes cluster, we don't provide at this moment a solution to backup its data

## Backup main files

The main files/folders used are:

- `backup/Dockerfile`: the OCI image that will run the workload
- `helm/kdl-server/templates/common/backup-cronjob.yaml`: the Cronjob manifest
- `helm/kdl-server/values.yaml`: please edit this file to suit your preferences for Helm deployment. 
- `helm/kdl-server/templates/common/backup-secrets.yaml`: you will need an AWS S3 bucket and AWS key pairs to upload the backup

## Configurable options

```yaml
backup:
  enabled: false
  schedule: "0 1 * * 0" # every sunday at 1:00 AM
  name: backup-gitea
  image: 
    repository: konstellation/kdl-backup
    tag: latest
    pullPolicy: IfNotPresent
  s3:
    awsAccessKeyID: aws-access-key-id
    awsSecretAccessKey: aws-secret-access-key
    bucketName: s3-bucket-name
  resources:
    requests:
      cpu: "100m"
      memory: "256Mi"
    limits:
      cpu: "10m"
      memory: "100Mi"
  extraVolumeMounts: []
  # extraVolumeMounts:
  #   - name: shared-storage
  #     mountPath: /backup
  #     readOnly: true
  extraVolumes: []
  # extraVolumes:
  #   - name: shared-storage
  #     hostPath:
  #       path: /backup
  #       type: Directory
```

## Alerting

TODO

## Kubernetes Objects Backup
In case of data loss, we can restore Gitea, Mongo, MLFlow, etc files and databases, but this makes no sense if we have not the `CustomResource`, `secrets` and any other Kubernetes API Objects created by the Go API when a new project is created.

## Backup Mongo

Projects, users and roles are being stored in a Mongo pod. The bindings are stored in the `kdl` db, under the `projects` and `users` collections. Although it would be enough to have data backed up, we also dumped the `admin` database in order to achieve consistency with all the references that the admin user has in each project because it's unique `ObjectId`.

## Backup Gitea DB

The `$GITEA_ADMIN_PASSWORD` is set to a default value, and overwritten using `kdlctl.conf` and Helm's CLI `--set .Values.gitea.admin.password`. When restoring to local environments, this password must be set to be equal as the source environment password.

To perform the backup, we have follow the commands in `kdl/helm/templates/common/backup-cronjob.yaml`

```bash
mkdir gitea-content
sudo cp -rf /var/snap/microk8s/common/default-storage/kdl-gitea-pvc-gitea-0-pvc-440ef212-e953-44e2-9f60-c1633ac2b9ec/ gitea-repositories-backup
sudo chown -R t7admin: gitea-content/git
sudo chown -R t7admin: gitea-content/gitea
sudo tar czf gitea-content.tar.gz gitea-content
sudo chown t7admin: gitea-content.tar.gz
```

### Backup MLFlow

The relevant files to be backed up are kept in:

- MLFlow DB
- MLFlow Tracking related files

These files and folders must be replaced in the fresh installation.

### Backup User Tools - Current state not necessary

It has been discussed to backup user custom plugins that are installed after user-tools	operator is run, and we have agreed that it's users duty to keep this kind of customization backed up. 

There are plugins available to synchronize user customizations in VSCode, like [Settings sync](https://code.visualstudio.com/docs/editor/settings-sync)

## Restore

To perform this operation, all needed tools are already insatalled and can be deployed as an ad-hoc pod using the manifes `backup/restore-pod.yaml`

###  Gitea

- Stop Gitea stateFulSet `kubectl -n kdl delete statefulset gitea`
- Deploy a pod from where perform the restore `kubectl -n kdl apply -f restore-pod.yaml`
- Open an interactive shell within the pod `kubectl -n kdl exec -it restore /bin/sh`
- Download the required backup from S3 Bucket `aws s3 cp s3://$BUCKET_NAME/backup_gitea_<date>.tar.gz .`
- Unzip backup `tar zxvf backup_gitea_<date>.tar.gz`
- Restore /data files

```bash
cd backup_gitea_<date>/
tar zxvf data.tar.gz
cp -R data/* /data/
chown -R 1000:1000 /data/
```

- Restore postgres db

```bash
$ dropdb -h postgres -U postgres gitea
[...]

$ psql -h postgres -U postgres
Password for user postgres: 
psql (12.2, server 12.1 (Debian 12.1-1.pgdg100+1))
Type "help" for help.

postgres=# CREATE DATABASE gitea;
[...]

$ pg_restore -h postgres -U postgres -v -d gitea ./postgres_gitea.dump
```

- Redeploy kdl-server to create Gitea installation `helm upgrade --install kdl-server --namespace kdl konstellation/kdl-server`

### MongoDB

Use the following command while being able to communicate to mongo pod. Change directory to wherever you have extracted the `dump` folder and execute `mongorestore`

### MLflow

If the MLFlow backup has been done, just move the files to the same location they were before. The project's folder structure is already created, so just paste into the parent folder

### Kubernetes API objects

For each of the manifests, execute `kubectl apply -f <file>`

## Resources

- [Accesing the Kubernetes API from a POD](https://kubernetes.io/docs/tasks/run-application/access-api-from-pod/)
- [Authentication for kubectl](https://kubernetes.io/docs/reference/access-authn-authz/authentication/#option-2-use-the-token-option)
- [mongorestore](https://docs.mongodb.com/database-tools/mongorestore/)