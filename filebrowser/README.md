# Filebrowser with S3Fuse

Docker image combining `Filebrowser` web interface with `S3Fuse` mount capabilities for S3-compatible storage, providing a seamless way to browse and manage files both locally and in S3 buckets.

## Security Features

* Non-root user (`filebrowser`) execution with configurable UID/GID (default `1000:1000`)
* Proper permission handling
* Tini as init system for proper process management

## Configuration

### Build Arguments

| Variable                 | Description                | Default |
|--------------------------|----------------------------|---------|
| `BASE_FILEBROWSER_IMAGE` | Filebrowser base image tag | `v2`    |
| `BASE_S3FUSE_IMAGE`      | S3Fuse base image tag      | `1.94`  |

### Environment Variables

| Variable                   | Description                     | Required |
|----------------------------|---------------------------------|----------|
| `AWS_S3_ACCESS_KEY_ID`     | AWS/S3 access key               | `Yes`    |
| `AWS_S3_BUCKET`            | S3 bucket name to mount         | `Yes`    |
| `AWS_S3_MOUNT`             | Mount point inside container    | `No`     |
| `AWS_S3_SECRET_ACCESS_KEY` | AWS/S3 secret key               | `Yes`    |
| `AWS_S3_URL`               | S3-compatible endpoint URL      | `Yes`    |
| `S3FS_ARGS`                | Additional S3Fuse mount options | `No`     |

## Storage

* Web interface files: `/srv`
* S3 bucket mount: configurable via `AWS_S3_MOUNT` (default: `/srv`)
* Filebrowser database: `/database.db`

## Local Deployment

Basic usage:

```bash
docker run -p 9696:9696              \
  -e "AWS_S3_ACCESS_KEY_ID=user"     \
  -e "AWS_S3_BUCKET=my-bucket"       \
  -e "AWS_S3_SECRET_ACCESS_KEY=pass" \
  -e "FB_ADDRESS="0.0.0.0"           \
  -e "FB_DATABASE=/database.db       \
  -e "FB_LOG=stdout                  \
  -e "FB_ROOT=/srv                   \
  --device /dev/fuse                 \
  --cap-add SYS_ADMIN                \
  --security-opt apparmor:unconfined \
  konstellation/kdl-filebrowser:latest
```

With custom configuration:

```bash
docker run -p 9696:9696              \
  --user 1000:1000                   \
  -e "AWS_S3_ACCESS_KEY_ID=user"     \
  -e "AWS_S3_BUCKET=my-bucket"       \
  -e "AWS_S3_MOUNT=/srv/data"        \
  -e "AWS_S3_SECRET_ACCESS_KEY=pass" \
  -e "AWS_S3_URL=http://minio:9000"  \
  -e "FB_ADDRESS="0.0.0.0"           \
  -e "FB_DATABASE=/database.db       \
  -e "FB_LOG=stdout                  \
  -e "FB_ROOT=/srv                   \
  -e "S3FS_ARGS=allow_other,use_path_request_style" \
  -v /path/to/config:/srv            \
  --device /dev/fuse                 \
  --cap-add SYS_ADMIN                \
  --security-opt apparmor:unconfined \
  konstellation/kdl-filebrowser:latest
```

Access the web interface at <http://localhost:9696>
