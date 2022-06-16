# Build API.
FROM golang:1.18.3-alpine3.16 as api-builder
# 1.18

# Pass Hadolint
LABEL maintainer="Builder"

ENV CGO_ENABLED=0

WORKDIR /app

# Only reinstall go deps if go.* has changed
COPY api/go.* ./

RUN go mod download

COPY api .

RUN go build -o kdl-server http/main.go

# Build UI
FROM node:14 as ui-builder

# Pass Hadolint
LABEL maintainer="Builder"

ENV SASS_PATH=src

WORKDIR /app

COPY ui/package.* ui/yarn* ./

RUN mkdir -p cypress/plugins && \
        yarn install

COPY ui/ .

RUN yarn build

# Create APP image
FROM alpine:3.15

# Maintainer of the Dockerfile
LABEL maintainer="Intelygenz - Konstellation Team"

ENV USER=kdl

WORKDIR /app

RUN adduser --disabled-password --gecos "" --no-create-home --uid 1001 ${USER} && \
        mkdir -p -mg=w /var/log/app && \
        mkdir .ssh && chown -R ${USER}:0 .ssh

COPY --from=api-builder --chown=kdl:0 /app/kdl-server /app/config.yml ./
COPY --from=api-builder --chown=kdl:0 /app/templates ./templates
COPY --from=ui-builder --chown=kdl:0 /app/build/ /public

# openssh-client is needed to clone git repositories using ssh on project creation
RUN apk add -U --no-cache ca-certificates openssh-client libcap && \
        setcap 'cap_net_bind_service=+ep' /app/kdl-server

USER ${USER}

CMD ["sh","-c","/app/kdl-server 2>&1 | tee -a /var/log/app/app.log"]
