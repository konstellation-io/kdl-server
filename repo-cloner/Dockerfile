# golang:1.23.2-alpine3.20
FROM golang@sha256:9dd2625a1ff2859b8d8b01d8f7822c0f528942fe56cfe7a1e7c38d3b8d72d679 AS builder

# environment variables
ENV CGO_ENABLED=0 \
    GOOS=linux    \
    GOARCH=amd64  \
    GO111MODULE=on

WORKDIR /app

# copy source code
COPY . .

# download dependencies
RUN --mount=type=cache,target=/go/pkg/mod    \
    go mod download                       && \
    go mod verify

# -ldflags="-s -w -extldflags '-static'": Optimizes binary size by removing debug info
# and ensures all C dependencies are included in the binary for better portability
# -trimpath: Removes build system paths to improve security and reproducibility
RUN go build -ldflags="-s -w -extldflags '-static'" \
    -trimpath                                       \
    -o repo-cloner

# final image
# alpine:3.20.0
FROM alpine@sha256:77726ef6b57ddf65bb551896826ec38bc3e53f75cdde31354fbffb4f25238ebd

LABEL maintainer="Intelygenz - Konstellation Team"

ARG USER=kdl
ARG UID=1000
ARG GID=1000
ENV HOME=/home/${USER}

# security updates, dependencies and user setup
# hadolint ignore=DL3018
RUN apk update                          && \
    apk upgrade                         && \
    apk add --no-cache                     \
      git=2.45.2-r0                        \
      openssh-client=9.7_p1-r5             \
    rm -rf /var/cache/apk/*             && \
    # create non-root user
    addgroup -g ${GID} ${USER}          && \
    adduser -D -g "" -h "${HOME}"          \
      -s "/sbin/nologin" -u ${UID}         \
      -G ${USER} ${USER}                && \
    # set up app directory
    mkdir -p /app                       && \
    chown -R ${UID}:${GID} /app         && \
    # set up SSH with secure permissions
    mkdir -p ${HOME}/.ssh               && \
    chown -R ${UID}:${GID} ${HOME}/.ssh && \
    chmod 700 ${HOME}/.ssh

WORKDIR /app

# copy binary and config
COPY --from=builder --chown=${UID}:${GID} /app/repo-cloner ./

USER ${USER}

ENTRYPOINT ["/app/repo-cloner"]
CMD []
