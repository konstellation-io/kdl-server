package minioadminservice

import "context"

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

// MinioAdminInterface defines all Minio admin operations.
type MinioAdminInterface interface {
	CreateUser(ctx context.Context, email, secretKey string) (string, error)
	DeleteUser(ctx context.Context, email string) error
	CreateProjectPolicy(ctx context.Context, projectName string) error
	DeleteProjectPolicy(ctx context.Context, projectName string) error
	CreateProjectUser(ctx context.Context, projectName, secretKey string) (string, error)
	DeleteProjectUser(ctx context.Context, projectName string) error
	JoinProject(ctx context.Context, email, projectName string) error
	LeaveProject(ctx context.Context, email, projectName string) error
}
