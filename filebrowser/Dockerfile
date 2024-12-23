ARG BASE_S3FUSE_IMAGE_VERSION=1.94
ARG BASE_FILEBROWSER_IMAGE_VERSION=v2

FROM efrecon/s3fs:${BASE_S3FUSE_IMAGE_VERSION} AS s3fs
FROM filebrowser/filebrowser:${BASE_FILEBROWSER_IMAGE_VERSION}

COPY --from=s3fs /usr/bin/s3fs /usr/bin/s3fs
COPY --from=s3fs /usr/local/bin/*.sh /usr/local/bin/
COPY --from=s3fs /etc/fuse.conf /etc/fuse.conf

# s3fs dependencies
RUN apk add --no-cache              \
    fuse                            \
    libxml2                         \
    libcurl                         \
    libgcc                          \
    libstdc++                       \
    tini                         && \
    mkdir -p /srv                && \
    # Create non-root user
    addgroup -g 1000 filebrowser && \
    adduser -D -u 1000 -G filebrowser filebrowser && \
    chown -R filebrowser:filebrowser /srv

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

VOLUME ["/srv"]
EXPOSE 9696

ENTRYPOINT ["tini", "-g", "--", "/entrypoint.sh"]
