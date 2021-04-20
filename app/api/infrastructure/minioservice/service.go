package minioservice

import (
	"context"
	"errors"
	"fmt"

	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

var (
	ErrBucketAlreadyExists = errors.New("bucket already exists in Minio")
	ErrChangingBucketName  = errors.New("impossible change bucket name")
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
func (m *minioService) CreateBucket(bucketName string) error {
	exists, err := m.client.BucketExists(context.Background(), bucketName)
	if err != nil {
		return err
	}

	if !exists {
		err = m.client.MakeBucket(context.Background(), bucketName, minio.MakeBucketOptions{})
		if err != nil {
			return err
		}

		m.logger.Infof("Created bucket \"%s\" in Minio", bucketName)

		return nil
	}

	return fmt.Errorf("%w: bucket name \"%s\"", ErrBucketAlreadyExists, bucketName)
}
