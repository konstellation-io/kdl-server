FROM python:3.9-slim

ENV AWS_ACCESS_KEY_ID=KG_ACCESS_KEY_ID
ENV AWS_SECRET_ACCESS_KEY=KG_AWS_SECRET_ACCESS_KEY
ENV AWS_DEFAULT_REGION=KG_AWS_DEFAULT_REGION

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
    && apt-get install -y build-essential wget git

WORKDIR /kg

COPY Pipfile* ./
RUN python3 -m pip install pipenv && \
    pipenv install --system --deploy

COPY src src

RUN dvc get https://github.com/konstellation-io/kdl-server --rev 4f4d6676b2f5e757baea5dad09f6219a4c4b376c kg/assets

RUN chown -R kdl:0 /kg \
    && chmod -R g+w /kg \
    && mkdir /var/log/app -p \
    && chown -R kdl:0 /var/log/app \
    && chmod -R g+w /var/log/app

USER kdl

CMD ["sh","-c","/usr/local/bin/python3 /kg/src/app.py 2>&1 | tee -a /var/log/app/app.log"]
