package minioadminservice

import "context"

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

// MinioAdminService defines all Minio admin operations.
type MinioAdminService interface {
	CreateUser(ctx context.Context, accessKey, secretKey string) error
	DeleteUser(ctx context.Context, accessKey string) error
	AssociateUserWithPolicy(ctx context.Context, accessKey, policyName string) error
	UpdatePolicy(ctx context.Context, policyName string, bucketNames []string) error
}
