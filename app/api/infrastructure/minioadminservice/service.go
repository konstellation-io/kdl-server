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

type MinioAdminService struct {
	logger logr.Logger
	client *madmin.AdminClient
}

// Assure implementation adheres to interface.
var _ MinioAdminInterface = (*MinioAdminService)(nil)

// Constructor for MinioAdminService.
func NewMinioAdminService(logger logr.Logger, endpoint, accessKey, secretKey string) (*MinioAdminService, error) {
	client, err := madmin.New(endpoint, accessKey, secretKey, false)
	if err != nil {
		return nil, err
	}

	return &MinioAdminService{logger: logger, client: client}, nil
}

func (m *MinioAdminService) CreateUser(ctx context.Context, accessKey, secretKey string) error {
	m.logger.Info("Creating user", "accessKey", accessKey)

	return m.client.AddUser(ctx, accessKey, secretKey)
}

func (m *MinioAdminService) AssignPolicy(ctx context.Context, accessKey, policyName string) error {
	m.logger.Info("Associating user to policy", "accessKey", accessKey, "policyName", policyName)

	return m.client.SetPolicy(ctx, policyName, accessKey, false)
}

func (m *MinioAdminService) DeleteUser(ctx context.Context, accessKey string) error {
	m.logger.Info("Deleting user", "accessKey", accessKey)

	err := m.client.RemoveUser(ctx, accessKey)
	if err != nil {
		var target madmin.ErrorResponse

		if errors.As(err, &target) && target.Code == "XMinioAdminNoSuchUser" {
			return nil // ignore error for idempotence
		}
	}

	return err
}

func (m *MinioAdminService) CreatePolicy(ctx context.Context, policyName, bucketName string) error {
	tmpl, err := template.New("policy").Parse(policyTemplate)
	if err != nil {
		return fmt.Errorf("failed to parse policy template: %w", err)
	}

	var policyBuffer bytes.Buffer
	err = tmpl.Execute(&policyBuffer, struct{ BucketName string }{BucketName: bucketName})

	if err != nil {
		return fmt.Errorf("failed to apply policy template: %w", err)
	}

	m.logger.Info("Updating policy", "policyName", policyName)

	err = m.client.AddCannedPolicy(ctx, policyName, policyBuffer.Bytes())
	if err != nil {
		return fmt.Errorf("failed to add policy %s: %w", policyName, err)
	}

	return err
}

func (m *MinioAdminService) DeletePolicy(ctx context.Context, policyName string) error {
	m.logger.Info("Deleting policy", "policyName", policyName)

	err := m.client.RemoveCannedPolicy(ctx, policyName)
	if err != nil {
		return fmt.Errorf("failed to remove policy %s: %w", policyName, err)
	}

	return err
}
