package minioadminservice

import "context"

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

// MinioAdminInterface defines all Minio admin operations.
type MinioAdminInterface interface {
	CreateUser(ctx context.Context, accessKey, secretKey string) error
	DeleteUser(ctx context.Context, accessKey string) error
	AssignPolicy(ctx context.Context, accessKey, policyName string) error
	UpdatePolicy(ctx context.Context, policyName string, bucketNames []string) error
	DeletePolicy(ctx context.Context, policyName string) error
}
