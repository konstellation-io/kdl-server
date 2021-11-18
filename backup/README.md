# KDL backup

This tool is intended to perform backups of KDL's Gitea internal database (PostgreSQL) and uploads it to an S3 Bucket.

## Backup schedule

The kdl-server Helm Chart is ready to configure the backup schedule as a cronjob. You only need to edit your custom 
`values.yaml` with the following information. You will need an AWS S3 bucket and AWS key pairs to upload the backup.

```yaml
backup:
  gitea:
    enabled: true
    schedule: "0 6 */1 * *" # every day at 6:00 AM
  s3:
    awsAccessKeyID: <yourawskeyid>
    awsSecretAccessKey: <yourawssecretkey>
    bucketName: <yourS3BackupBucketName>
```

## How to restore Gitea

* Stop Gitea stateFulSet
  
`kubectl -n kdl delete statefulset gitea`

* Deploy a pod from where perform the restore

`kubectl -n kdl apply -f restore-pod.yaml`

* Open an interactive shell within the pod

`kubectl -n kdl exec -it restore /bin/sh`

* Download the required backup from S3 Bucket
  
`aws s3 cp s3://$BUCKET_NAME/backup_gitea_<date>.tar.gz .`

* Unzip backup

`tar zxvf backup_gitea_<date>.tar.gz`

* Restore /data files

```bash
cd backup_gitea_<date>/
tar zxvf data.tar.gz
cp -R data/* /data/
chown -R 1000:1000 /data/
```

* Restore postgres db

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

* Redeploy kdl-server to create Gitea installation

`helm upgrade --install kdl-server --namespace kdl konstellation/kdl-server`

*NOTE:* The command above depends on how the kdl-server Helm chart was deployed. Use this just as a guide, not literal.

## Kubernetes Objects Backup - Current state - Ready to go

In case of data loss, we can restore Gitea, Mongo, MLFlow, etc files and databases, but this makes no sense if we have not the `CustomResource`, `secrets` and any other Kubernetes API Objects created by the Go API when a new project is created.

## Backup Mongo - Current state - Ready to go

Projects, users and roles are being stored in a Mongo pod. The bindings are stored in the `kdl` db, under the `projects` and `users` collections. Although it would be enough to have data backed up, we also dumped the `admin` database in order to achieve consistency with all the references that the admin user has in each project because it's unique `ObjectId`.

## Backup Gitea DB (using cronjob) - Current state - Ready to go

Science Toolkit Team were doing this backup using a `CronJob` (**the last successful backup was performed on November 2020**) and they were using a **manual process to restore it** using an ad-hoc pod and `psql` commands. The Kubernetes manifests can be found in `helm/templates/gitea/restore-pod.yml`.

Some things that must be noticed:

- Backup was being made into AWS T7 Account in the bucket `s3://science-toolkit-gitea-backup`
- The `$GITEA_ADMIN_PASSWORD` is set to a default value, and overwritten using `kdlctl.conf` and Helm's CLI `--set .Values.gitea.admin.password`. When restoring to local environments, this password must be set to be equal as the source environment password.

To perform the backup, we have follow the commands in `kdl/helm/templates/common/backup-cronjob.yaml`

```bash
# This steps are done in Dell
mkdir gitea-content
sudo cp -rf /var/snap/microk8s/common/default-storage/kdl-gitea-pvc-gitea-0-pvc-440ef212-e953-44e2-9f60-c1633ac2b9ec/ gitea-repositories-backup
sudo chown -R t7admin: gitea-content/git
sudo chown -R t7admin: gitea-content/gitea
sudo tar czf gitea-content.tar.gz gitea-content
sudo chown t7admin: gitea-content.tar.gz
```

### Backup MLFlow - Current state - Ready to go

The relevant files to be backed up are kept in:

- MLFlow DB
- MLFlow Tracking related files

These files and folders must be replaced in the fresh installation.

### Backup User Tools - Current state not necessary

It has been discussed to backup user custom plugins that are installed after user-tools	operator is run, and we have agreed that it's users duty to keep this kind of customization backed up. 

There are plugins available to synchronize user customizations in VSCode, like [Settings sync](https://code.visualstudio.com/docs/editor/settings-sync)