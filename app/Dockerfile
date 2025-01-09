###
# build app-api
###
FROM golang:1.23.2-alpine3.20 AS api-builder

# environment variables
ENV CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64 \
    GO111MODULE=on

WORKDIR /app

# copy dependencies code
COPY api/go.* ./

# download dependencies
RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download && \
    go mod verify

# copy source code
COPY api .

# -ldflags="-s -w -extldflags '-static'": Optimizes binary size by removing debug info
# and ensures all C dependencies are included in the binary for better portability
# -trimpath: Removes build system paths to improve security and reproducibility
RUN go build \
    -ldflags="-s -w \
    -extldflags '-static'" \
    -trimpath \
    -o kdl-server http/main.go

###
# build app-ui
###
FROM node:16 AS ui-builder

ENV SASS_PATH=src

WORKDIR /app

# copy packages to cache dependencies
COPY ui/package.json ui/yarn.lock ./

# install dependencies
RUN mkdir -p cypress/plugins && \
    yarn install --frozen-lockfile

# copy source files
COPY ui/ .

# build ui
RUN yarn build

###
# final image
###
FROM alpine:3.20.0

LABEL maintainer="Intelygenz - Konstellation Team"

ARG USER=kdl
ARG UID=1000
ARG GID=1000
ENV HOME=/home/${USER}

# security updates, dependencies and user setup
# hadolint ignore=DL3018
RUN apk update                               && \
    apk upgrade                              && \
    apk add --no-cache                          \
        openssh-client=9.7_p1-r4                \
        libcap=2.70-r0                       && \
    rm -rf /var/cache/apk/*                  && \
    # create non-root user
    addgroup -g ${GID} ${USER}               && \
    adduser -D -g "" -h "${HOME}"               \
        -s "/sbin/nologin"                      \
        -u ${UID}                               \
        -G ${USER} ${USER}                   && \
    # setup application directories
    mkdir -p /app /var/log/app               && \
    chown -R ${UID}:${GID} /app /var/log/app && \
    # setup SSH with secure permissions
    mkdir -p ${HOME}/.ssh                    && \
    chown -R ${UID}:${GID} ${HOME}/.ssh      && \
    chmod 700 ${HOME}/.ssh

WORKDIR /app

# copy from app-api and app-ui stages
COPY --from=api-builder --chown=${USER}:${USER} /app/kdl-server ./
COPY --from=ui-builder --chown=${USER}:${USER} /app/build/ /public

RUN setcap 'cap_net_bind_service=+ep' /app/kdl-server

# switch to non-root user
USER ${USER}

# use proper entrypoint script
COPY --chown=${USER}:${USER} docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["/app/kdl-server"]
