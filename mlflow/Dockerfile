# ghcr.io/mlflow/mlflow:v2.18.0
FROM ghcr.io/mlflow/mlflow@sha256:09d25b0c80efa2c1dd4b5e4834a1a0ed861d6b1c2b43017ff99493bd5c6bb4ee

# maintainer of the Dockerfile
LABEL maintainer="Intelygenz - Konstellation Team"

# set build arguments
ARG USER="mlflow"
ARG UID="1000"
ARG GID="1000"
ENV PIP_NO_CACHE_DIR=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /mlflow/tracking

# non-root user
RUN groupadd -r -g ${GID} ${USER}                                  && \
    useradd -l -r -u ${UID} -g ${USER} -m -s /sbin/nologin ${USER} && \
    chown -R ${UID}:${GID} /mlflow                                 && \
    chown -R ${UID}:${GID} /home/${USER}

# packages to use sqlite
RUN apt-get update                              && \
    apt-get install -yq --no-install-recommends    \
      sqlite3=3.34.1-3+deb11u1                  && \
    apt-get clean                               && \
    rm -rf /var/lib/apt/lists/*                 && \
    rm -rf /var/cache/apt/*

# python packages
USER ${USER}
RUN pip install --no-cache-dir --user \
    boto3==1.35.76                    \
    psycopg2-binary==2.9.1

# ref: https://mlflow.org/docs/latest/cli.html
CMD ["mlflow", "server", "--host", "0.0.0.0"]
