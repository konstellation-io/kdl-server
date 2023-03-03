package minioservice

import "context"

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

// MinioService defines all Minio operations.
type MinioService interface {
	CreateBucket(ctx context.Context, bucketName string) error
	CreateProjectDirs(ctx context.Context, bucketName string) error
	DeleteBucket(ctx context.Context, bucketName string) (string, error)
}
