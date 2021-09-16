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
