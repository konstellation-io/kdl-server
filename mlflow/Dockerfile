ARG MLFOW_IMAGE=v2.18.0

FROM ghcr.io/mlflow/mlflow:${MLFOW_IMAGE}

# Maintainer of the Dockerfile
LABEL maintainer="Intelygenz - Konstellation Team"

# Set build arguments
ARG MLFLOW_USER="mlflow"
ARG MLFLOW_UID="1000"
ARG MLFLOW_GID="1000"
ENV PIP_NO_CACHE_DIR=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1


# non-root user
RUN groupadd -r -g ${MLFLOW_GID} ${MLFLOW_USER} && \
    useradd -r -u ${MLFLOW_UID} -g ${MLFLOW_USER} -m -s /sbin/nologin ${MLFLOW_USER}

WORKDIR /mlflow/tracking
RUN chown -R ${MLFLOW_UID}:${MLFLOW_GID} /mlflow && \
    chown -R ${MLFLOW_UID}:${MLFLOW_GID} /home/${MLFLOW_USER}

# packages to use sqlite
RUN apt-get update && \
    apt-get install -yq --no-install-recommends \
      sqlite3 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    rm -rf /var/cache/apt/*

# python packages
COPY --chown=${MLFLOW_USER}:${MLFLOW_USER} requirements.txt /mlflow/tracking/requirements.txt
USER ${MLFLOW_USER}
RUN pip install --no-cache-dir --user -r requirements.txt

# ENV ARTIFACTS_BUCKET
# ENV AWS_ACCESS_KEY_ID
# ENV AWS_SECRET_ACCESS_KEY
# ENV MLFLOW_S3_ENDPOINT_URL

CMD ["mlflow", "server", "--backend-store-uri", "sqlite:///mlflow.db", "--default-artifact-root", "s3://$ARTIFACTS_BUCKET", "--host", "0.0.0.0"]
