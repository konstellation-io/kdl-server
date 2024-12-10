# MLFlow Tracking Server

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
| `MLFLOW_USER` | Non-root user name | `mlflow`  |
| `MLFLOW_UID`  | User ID            | `1000`    |
| `MLFLOW_GID`  | Group ID           | `1000`    |

### Environment variables

| Variable                 | Description                  | Required |
|--------------------------|------------------------------|----------|
| `AWS_ACCESS_KEY_ID`      | AWS credentials              | `Yes`    |
| `AWS_SECRET_ACCESS_KEY`  | AWS credentials              | `Yes`    |
| `MLFLOW_S3_ENDPOINT_URL` | MinIO S3 endpoint URL        | `Yes`    |
| `ARTIFACTS_BUCKET`       | S3 bucket name for artifacts | `Yes`    |

## Storage

* Artifacts: stored in MinIO bucket set in `ARTIFACTS_BUCKET`
* Tracking data: SQLite database in `/mlflow/tracking`
* User home: `/home/mlflow`

## Local deployment

Basic usage:

```bash
docker run -p 5000:5000 \
  -e "ARTIFACTS_BUCKET=mlflow-artifacts" \
  -e "AWS_ACCESS_KEY_ID=user" \
  -e "AWS_SECRET_ACCESS_KEY=pass" \
  -e "MLFLOW_S3_ENDPOINT_URL=http://my_minio.url" \
  konstellation/kdl-mlflow:latest
```

With persistence and custom user:

```bash
docker run -p 5000:5000 \
  --user 1000:1000 \
  -e "ARTIFACTS_BUCKET=mlflow-artifacts" \
  -e "AWS_ACCESS_KEY_ID=user" \
  -e "AWS_SECRET_ACCESS_KEY=pass" \
  -e "MLFLOW_S3_ENDPOINT_URL=http://my_minio.url" \
  -v /path/to/data:/mlflow/tracking \
  konstellation/kdl-mlflow:latest
```

Access the UI at [http://localhost:5000](http://localhost:5000)

## Documentation

* [Science Toolkit docs](https://konstellation-io.github.io/science-toolkit/)
* [Docker Hub](https://hub.docker.com/r/konstellation/mlflow)
* [MinIO](https://min.io/)
