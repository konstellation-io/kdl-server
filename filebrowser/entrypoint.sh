#!/bin/sh
set -e

# mount S3 bucket if configured
if [ -n "$AWS_S3_BUCKET" ]; then
    echo "Mounting S3 bucket..."

    # set up authentication
    if [ -n "$AWS_S3_ACCESS_KEY_ID" ] && [ -n "$AWS_S3_SECRET_ACCESS_KEY" ]; then
        mkdir -p $HOME/.s3fs
        echo "$AWS_S3_ACCESS_KEY_ID:$AWS_S3_SECRET_ACCESS_KEY" > $HOME/.s3fs/passwd
        chmod 600 $HOME/.s3fs/passwd
    fi

    # mount the bucket
    s3fs "$AWS_S3_BUCKET" "$AWS_S3_MOUNT" \
        -o passwd_file=$HOME/.s3fs/passwd \
        -o url="$AWS_S3_URL"              \
        -o allow_other                    \
        $S3FS_ARGS

    # wait for mount to be ready
    while ! mountpoint -q "$AWS_S3_MOUNT"; do
        echo "Waiting for S3 mount to be ready..."
        sleep 1
    done
    echo "S3 mount completed"
fi

# start filebrowser
echo "Starting filebrowser..."
exec /filebrowser
