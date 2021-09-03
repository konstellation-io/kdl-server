FROM python:3.6.9-stretch

# ENV MLFLOW_S3_ENDPOINT_URL
# ENV AWS_ACCESS_KEY_ID
# ENV AWS_SECRET_ACCESS_KEY
# ENV ARTIFACTS_BUCKET

RUN apt update && apt install -yq --no-install-recommends \
    sqlite

RUN pip install --no-cache-dir -r requirements.txt

WORKDIR /mlflow/tracking

CMD mlflow server --backend-store-uri sqlite:///mlflow.db --default-artifact-root s3://$ARTIFACTS_BUCKET --host 0.0.0.0
