package minioadminservice

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"text/template"

	"github.com/go-logr/logr"
	"github.com/minio/madmin-go/v2"

	_ "embed"
)

//go:embed templates/policy.go.tmpl
var policyTemplate string

var errEmptyBucketList = errors.New("the bucket list is empty")

type minioAdminService struct {
	logger logr.Logger
	client *madmin.AdminClient
}

// NewMinioAdminService is a constructor function.
func NewMinioAdminService(logger logr.Logger, endpoint, accessKey, secretKey string) (MinioAdminService, error) {
	client, err := madmin.New(endpoint, accessKey, secretKey, false)
	if err != nil {
		return nil, err
	}

	return &minioAdminService{logger: logger, client: client}, nil
}

func (m *minioAdminService) CreateUser(ctx context.Context, accessKey, secretKey string) error {
	m.logger.Info("Creating user", "accessKey", accessKey)

	return m.client.AddUser(ctx, accessKey, secretKey)
}

func (m *minioAdminService) AssignPolicy(ctx context.Context, accessKey, policyName string) error {
	m.logger.Info("Associating user to policy", "accessKey", accessKey, "policyName", policyName)

	return m.client.SetPolicy(ctx, policyName, accessKey, false)
}

func (m *minioAdminService) DeleteUser(ctx context.Context, accessKey string) error {
	m.logger.Info("Deleting uses", "accessKey", accessKey)

	return m.client.RemoveUser(ctx, accessKey)
}

func (m *minioAdminService) UpdatePolicy(ctx context.Context, policyName string, bucketNames []string) error {
	tmpl, err := template.New("policy").Parse(policyTemplate)
	if err != nil {
		return fmt.Errorf("failed to parse policy template: %w", err)
	}

	if len(bucketNames) == 0 {
		return errEmptyBucketList
	}

	var policyBuffer bytes.Buffer
	err = tmpl.Execute(&policyBuffer, struct {
		Buckets []string
	}{
		Buckets: bucketNames,
	})

	fmt.Printf("policyBuffer: %s\n", policyBuffer.String())

	if err != nil {
		return fmt.Errorf("failed to apply policy template: %w", err)
	}

	m.logger.Info("Updating policy", "policyName", policyName)

	return m.client.AddCannedPolicy(ctx, policyName, policyBuffer.Bytes())
}

func (m *minioAdminService) DeletePolicy(ctx context.Context, policyName string) error {
	err := m.client.RemoveCannedPolicy(ctx, policyName)
	if err != nil {
		return fmt.Errorf("failed to parse policy template: %w", err)
	}

	return err
}
