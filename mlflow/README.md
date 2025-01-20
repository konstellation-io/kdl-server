# MLflow Tracking Server

Docker image for `MLflow Tracking Server`, part of the `Science Toolkit` ecosystem for data scientists.

## Security features

* Non-root user (`mlflow`) execution with configurable UID/GID (default `1000:1000`)
* Python security optimizations
* Proper permission handling

## Configuration

### Build arguments

| Variable      | Description        | Default   |
|---------------|--------------------|-----------|
| `MLFOW_IMAGE` | MLflow version tag | `v2.18.0` |
| `USER`        | Non-root user name | `mlflow`  |
| `UID`         | User ID            | `1000`    |
| `GID`         | Group ID           | `1000`    |

### Environment variables

| Variable                 | Description           | Required |
|--------------------------|-----------------------|----------|
| `AWS_ACCESS_KEY_ID`      | AWS credentials       | `Yes`    |
| `AWS_SECRET_ACCESS_KEY`  | AWS credentials       | `Yes`    |
| `MLFLOW_S3_ENDPOINT_URL` | MinIO S3 endpoint URL | `Yes`    |

## Storage

* Artifacts: stored in MinIO bucket set in `s3://<projectId>/<ARTIFACTS_DIR env>`
* Tracking data: SQLite database in `/mlflow/tracking`
* User home: `/home/mlflow`

## Local deployment

Basic usage:

```bash
docker run -p 5000:5000 \
  -e "AWS_ACCESS_KEY_ID=user" \
  -e "AWS_SECRET_ACCESS_KEY=pass" \
  -e "MLFLOW_S3_ENDPOINT_URL=http://my_minio.url" \
  konstellation/kdl-mlflow:latest
```

With persistence and custom user:

```bash
docker run -p 5000:5000 \
  --user 1000:1000 \
  -e "AWS_ACCESS_KEY_ID=user" \
  -e "AWS_SECRET_ACCESS_KEY=pass" \
  -e "MLFLOW_S3_ENDPOINT_URL=http://my_minio.url" \
  -v /path/to/data:/mlflow/tracking \
  konstellation/kdl-mlflow:latest
```

Access the UI at [http://localhost:5000](http://localhost:5000)

## Documentation

* [Custom image](https://hub.docker.com/r/konstellation/kdl-mlflow)
* [MLflow environment](https://mlflow.org/docs/latest/cli.html)
