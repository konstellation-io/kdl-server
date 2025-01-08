ARG BASE_S3FUSE_IMAGE_VERSION=1.94
ARG BASE_FILEBROWSER_IMAGE_VERSION=v2

FROM efrecon/s3fs:${BASE_S3FUSE_IMAGE_VERSION} AS s3fs
FROM filebrowser/filebrowser:${BASE_FILEBROWSER_IMAGE_VERSION}

COPY --from=s3fs /usr/bin/s3fs /usr/bin/s3fs
COPY --from=s3fs /usr/local/bin/*.sh /usr/local/bin/
COPY --from=s3fs /etc/fuse.conf /etc/fuse.conf

ARG USER=filebrowser
ARG UID=1000
ARG GID=1000

# s3fs dependencies
RUN apk add --no-cache              \
    fuse                            \
    libxml2                         \
    libcurl                         \
    libgcc                          \
    libstdc++                       \
    tini                         && \
    mkdir -p /srv                && \
    # create non-root user
    addgroup -g ${GID} ${USER}   && \
    adduser -D -u ${UID}            \
      -G ${USER} ${USER}         && \
    # set up app directory
    chown -R ${UID}:${GID} /srv

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

VOLUME ["/srv"]
EXPOSE 9696

ENTRYPOINT ["tini", "-g", "--", "/entrypoint.sh"]
