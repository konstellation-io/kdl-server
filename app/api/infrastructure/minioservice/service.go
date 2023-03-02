package minioservice

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"

	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
)

var (
	ErrBucketAlreadyExists = errors.New("bucket already exists in Minio")
)

type minioService struct {
	logger logging.Logger
	client *minio.Client
}

// NewMinioService is a constructor function.
func NewMinioService(logger logging.Logger, url, accessKey, secretKey string) (MinioService, error) {
	client, err := minio.New(url, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure: false,
	})
	if err != nil {
		return nil, err
	}

	return &minioService{logger: logger, client: client}, nil
}

// CreateBucket creates a new bucket in Minio.
func (m *minioService) CreateBucket(ctx context.Context, bucketName string) error {
	exists, err := m.client.BucketExists(context.Background(), bucketName)
	if err != nil {
		return err
	}

	if !exists {
		err = m.client.MakeBucket(ctx, bucketName, minio.MakeBucketOptions{})
		if err != nil {
			return err
		}

		m.logger.Infof("Created bucket \"%s\" in Minio", bucketName)

		return nil
	}

	return fmt.Errorf("%w: bucket name \"%s\"", ErrBucketAlreadyExists, bucketName)
}

func (m *minioService) CreateProjectDirs(ctx context.Context, bucketName string) error {
	folders := []string{
		"data/raw/",
		"data/processed/",
		"mlflow-artifacts/",
		"krt/",
	}

	for _, f := range folders {
		// Creating an empty file with an ending slash in the name, is the only way to create empty dirs in Minio
		_, err := m.client.PutObject(ctx, bucketName, f, bytes.NewReader([]byte{}), 0, minio.PutObjectOptions{})
		if err != nil {
			return err
		}
	}

	return nil
}

func (m *minioService) DeleteBucket(ctx context.Context, bucketName string) (string, error) {
	backupBucketName := fmt.Sprintf("%s-backup-%d", bucketName, time.Now().UnixMilli())

	err := m.CreateBucket(ctx, backupBucketName)
	if err != nil {
		return "", err
	}

	objects := m.client.ListObjects(ctx, bucketName, minio.ListObjectsOptions{
		Recursive: true,
	})

	m.logger.Debugf("Copying content from bucket %q to bucket %q", bucketName, backupBucketName)

	for object := range objects {
		if object.Err != nil {
			return "", fmt.Errorf("error listing objects: %w", object.Err)
		}

		dstOpt := minio.CopyDestOptions{
			Bucket: backupBucketName,
			Object: object.Key,
		}
		srcOpt := minio.CopySrcOptions{
			Bucket: bucketName,
			Object: object.Key,
		}

		_, err := m.client.CopyObject(ctx, dstOpt, srcOpt)
		if err != nil {
			return "", fmt.Errorf("error copying object: %w", err)
		}
	}

	removeBucketOpts := minio.RemoveBucketOptions{
		ForceDelete: true,
	}

	err = m.client.RemoveBucketWithOptions(ctx, bucketName, removeBucketOpts)
	if err != nil {
		return "", fmt.Errorf("error deleting bucket: %w", err)
	}

	m.logger.Infof("Bucket %q removed", bucketName)

	return backupBucketName, nil
}
