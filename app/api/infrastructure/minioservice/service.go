package minioservice

import (
	"bytes"
	"context"
	"errors"
	"fmt"

	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
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
		// Creating an empty file with a ending slash in the name, is the only way to create empty dirs in Minio
		_, err := m.client.PutObject(ctx, bucketName, f, bytes.NewReader([]byte{}), 0, minio.PutObjectOptions{})
		if err != nil {
			return err
		}
	}

	return nil
}
