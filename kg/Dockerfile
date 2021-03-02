FROM python:3.9-slim

# Create kdl user.
ENV USER=kdl
ENV UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistant" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    "${USER}"

RUN apt-get update \
    && apt-get install -y build-essential wget

WORKDIR /kg

COPY Pipfile* ./
RUN python3 -m pip install pipenv && \
    pipenv install --system --deploy

COPY assets.dvc assets.dvc
COPY .dvc .dvc
COPY src src

RUN wget https://github.com/iterative/dvc/releases/download/1.11.16/dvc_1.11.16_amd64.deb \
    && apt install -y ./dvc_1.11.16_amd64.deb \
    && dvc get https://github.com/konstellation-io/kdl-server --rev 5f62b434d299f1240b02b749448b0b299d58b387  kg/assets \
    && rm -rf dvc_1.11.16_amd64.deb

RUN chown -R kdl:0 /kg \
    && chmod -R g+w /kg \
    && mkdir /var/log/app -p \
    && chown -R kdl:0 /var/log/app \
    && chmod -R g+w /var/log/app

USER kdl

CMD ["sh","-c","/usr/local/bin/python3 /kg/src/app.py 2>&1 | tee -a /var/log/app/app.log"]
