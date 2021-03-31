package minioservice

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

// MinioService defines all Minio operations.
type MinioService interface {
	CreateBucket(bucketName string) error
	UpdateBucketName(oldBucketName, newBucketName string) error
}
