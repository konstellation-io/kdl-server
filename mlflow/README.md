# MLFlow Tracking Server

This repo hold the creation of Docker image to run MLFlow Tracking Server.

This component is part of a toolkit used to simplify the data scientists daily work.
For more details check out the [Science Toolkit documentation][1] and [Docker Hub][2]

## Inputs

The following inputs must be provided:

| **Variable**         | **Description**                 |
|----------------------|---------------------------------|
| AWS_ACCESS_KEY_ID  | AWS credentials  |
| AWS_SECRET_ACCESS_KEY  | AWS credentials  |
| MLFLOW_S3_ENDPOINT_URL | AWS S3 Endpoint where [Min.io][3] bucket can be reached |
| ARTIFACTS_BUCKET  | AWS S3 bucket name where artifacts are stored  |



## Outputs

The following outputs are generated for

- Artifacts are stored in a [Min.io][3] bucket
- Logs in the local directory `/mlflow/tracking`. If you want to persist the log folder you need to mount an external volume in this path.

## How to run it locally

```bash
docker run -p 5000:5000 \
        -e "MLFLOW_S3_ENDPOINT_URL=http://my_minio.url" 
        -e "AWS_ACCESS_KEY_ID=user" 
        -e "AWS_SECRET_ACCESS_KEY=pass" 
        -e "ARTIFACTS_BUCKET=mlflow-artifacts" 
        konstellation/mlflow:latest
```

After that, the MLFlow Tracking server will be available opening a browser the URL [http://localhost:5000][4].

[1]: (https://konstellation-io.github.io/science-toolkit/)
[2]: (https://hub.docker.com/r/konstellation/mlflow)
[3]: (https://min.io/)
[4]: (http://localhost:5000)