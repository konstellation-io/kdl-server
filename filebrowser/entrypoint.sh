# Mount S3 bucket if configured
if [ -n "$AWS_S3_BUCKET" ]; then
    echo "Mounting S3 bucket..."

    # Set up authentication
    if [ -n "$AWS_S3_ACCESS_KEY_ID" ] && [ -n "$AWS_S3_SECRET_ACCESS_KEY" ]; then
        echo "$AWS_S3_ACCESS_KEY_ID:$AWS_S3_SECRET_ACCESS_KEY" > /etc/passwd-s3fs
        chmod 600 /etc/passwd-s3fs
    fi

    # Mount the bucket
    s3fs "$AWS_S3_BUCKET" "$AWS_S3_MOUNT" \
        -o passwd_file=/etc/passwd-s3fs \
        -o url="$AWS_S3_URL" \
        -o allow_other \
        $S3FS_ARGS

    # Wait for mount to be ready
    while ! mountpoint -q "$AWS_S3_MOUNT"; do
        echo "Waiting for S3 mount to be ready..."
        sleep 1
    done
    echo "S3 mount completed"
fi

# Start filebrowser
echo "Starting filebrowser..."
exec /filebrowser
