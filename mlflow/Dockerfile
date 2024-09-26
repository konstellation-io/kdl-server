FROM python:3.12

# Maintainer of the Dockerfile
LABEL maintainer="Intelygenz - Konstellation Team"

WORKDIR /mlflow/tracking

# ENV MLFLOW_S3_ENDPOINT_URL
# ENV AWS_ACCESS_KEY_ID
# ENV AWS_SECRET_ACCESS_KEY
# ENV ARTIFACTS_BUCKET

RUN apt-get update && apt-get install -yq --no-install-recommends \
    sqlite3

COPY requirements.txt /mlflow/tracking/requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

CMD ["mlflow", "server", "--backend-store-uri", "sqlite:///mlflow.db", "--default-artifact-root", "s3://$ARTIFACTS_BUCKET", "--host 0.0.0.0"]
