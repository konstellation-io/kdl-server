ARG BASE_S3FUSE_IMAGE_VERSION=1.94
ARG BASE_FILEBROWSER_IMAGE_VERSION=v2.31.2

FROM efrecon/s3fs:${BASE_S3FUSE_IMAGE_VERSION} AS s3fs
FROM filebrowser/filebrowser:${BASE_FILEBROWSER_IMAGE_VERSION}

LABEL maintainer="Intelygenz - Konstellation Team"

# copy dependencies code
COPY --from=s3fs /usr/bin/s3fs /usr/bin/s3fs
COPY --from=s3fs /usr/local/bin/*.sh /usr/local/bin/
COPY --from=s3fs /etc/fuse.conf /etc/fuse.conf

ARG USER=filebrowser
ARG UID=1000
ARG GID=1000

# s3fs dependencies
# security updates, dependencies and user setup
# hadolint ignore=DL3018
RUN apk add --no-cache                 \
    fuse=2.9.9-r5                      \
    libxml2=2.12.7-r0                  \
    libcurl=8.10.1-r0                  \
    libgcc=13.2.1_git20240309-r0       \
    libstdc++=13.2.1_git20240309-r0    \
    tini=0.19.0-r3                  && \
    mkdir -p /srv                   && \
    # create non-root user
    addgroup -g ${GID} ${USER}      && \
    adduser -D -u ${UID}               \
      -G ${USER} ${USER}            && \
    # set up app directory
    chown -R ${UID}:${GID} /srv

# switch to non-root user
USER ${USER}

VOLUME ["/srv"]
EXPOSE 9696

# entrypoint create when project-operator deploy release
ENTRYPOINT ["tini", "-g", "--", "/entrypoint.sh"]
