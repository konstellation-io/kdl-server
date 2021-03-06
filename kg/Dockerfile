FROM python:3.9-slim

# Create kdl user.
ENV USER=kdl
ENV UID=10001
ENV ASSET_COMMIT="v0.5.0"
ENV REPO_URL="https://github.com/konstellation-io/kdl-server"
ENV PYTHONPATH="/kg/src"

RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistant" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    "${USER}"

RUN apt-get update \
    && apt-get install -y build-essential wget git libblas-dev liblapack-dev swig

WORKDIR /kg

COPY Pipfile* ./
RUN python3 -m pip install pipenv && \
    pipenv install --system --deploy

COPY src/ src/

WORKDIR /kg/assets

RUN dvc get $REPO_URL --rev $ASSET_COMMIT kg/assets/vectors.faiss && \
    dvc get $REPO_URL --rev $ASSET_COMMIT kg/assets/model && \
    dvc get $REPO_URL --rev $ASSET_COMMIT kg/assets/topics.pkl.gz && \
    dvc get $REPO_URL --rev $ASSET_COMMIT kg/assets/dataset.pkl.gz

WORKDIR /kg

RUN chown -R kdl:0 /kg \
    && chmod -R g+w /kg \
    && mkdir /var/log/app -p \
    && chown -R kdl:0 /var/log/app \
    && chmod -R g+w /var/log/app

USER kdl

CMD ["sh","-c","/usr/local/bin/python3 /kg/src/server/app.py 2>&1 | tee -a /var/log/app/app.log"]
