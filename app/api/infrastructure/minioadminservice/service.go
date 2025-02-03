package minioadminservice

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"text/template"

	"github.com/Masterminds/sprig/v3"
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

func (m *MinioAdminService) getUserAccessKey(email string) string {
	return email
}

func (m *MinioAdminService) getProjectAccessKey(projectName string) string {
	return projectName
}

func (m *MinioAdminService) CreateUser(ctx context.Context, email, secretKey string) (string, error) {
	if email == "" {
		return "", errEmptyEmail
	}

	accessKey := m.getUserAccessKey(email)

	m.logger.Info("Creating user", "email", email, "accessKey", accessKey)

	err := m.client.AddUser(ctx, accessKey, secretKey)
	if err != nil {
		return "", fmt.Errorf("failed to create user %s, access key %s: %w", email, accessKey, err)
	}

	return accessKey, nil
}

func (m *MinioAdminService) CreateProjectUser(ctx context.Context, projectName, secretKey string) (string, error) {
	accessKey := m.getProjectAccessKey(projectName)

	m.logger.Info("Creating project user", "projectName", projectName)

	err := m.client.AddUser(ctx, accessKey, secretKey)
	if err != nil {
		return "", fmt.Errorf("failed to create project user %s, access key %s: %w", projectName, accessKey, err)
	}

	m.logger.Info("Associating user to policy", "accessKey", accessKey, "policyName", projectName)

	err = m.client.SetPolicy(ctx, projectName, accessKey, false)
	if err != nil {
		return "", fmt.Errorf("failed associate project user %s: %w", projectName, err)
	}

	return accessKey, nil
}

func (m *MinioAdminService) removeUser(ctx context.Context, accessKey string) error {
	err := m.client.RemoveUser(ctx, accessKey)
	if err != nil {
		var target madmin.ErrorResponse

		if errors.As(err, &target) && target.Code == "XMinioAdminNoSuchUser" {
			return nil // ignore error for idempotence
		}
	}

	return err
}

func (m *MinioAdminService) DeleteUser(ctx context.Context, email string) error {
	accessKey := m.getUserAccessKey(email)

	m.logger.Info("Deleting user", "email", email, "accessKey", accessKey)

	return m.removeUser(ctx, accessKey)
}

func (m *MinioAdminService) DeleteProjectUser(ctx context.Context, projectName string) error {
	accessKey := m.getProjectAccessKey(projectName)

	m.logger.Info("Deleting project user", "projectName", projectName, "accessKey", accessKey)

	return m.removeUser(ctx, accessKey)
}

func (m *MinioAdminService) renderPolicy(bucketNames []string) ([]byte, error) {
	var policyBuffer bytes.Buffer

	tmpl, err := template.New("policy").Funcs(sprig.FuncMap()).Parse(policyTemplate)
	if err != nil {
		return nil, fmt.Errorf("failed to parse policy template: %w", err)
	}

	err = tmpl.Execute(&policyBuffer, struct{ BucketNames []string }{BucketNames: bucketNames})
	if err != nil {
		return nil, fmt.Errorf("failed to apply policy template: %w", err)
	}

	return policyBuffer.Bytes(), nil
}

func (m *MinioAdminService) CreateProjectPolicy(ctx context.Context, projectName string) error {
	m.logger.Info("Updating policy", "projectName", projectName)

	policy, err := m.renderPolicy([]string{projectName})
	if err != nil {
		return err
	}

	err = m.client.AddCannedPolicy(ctx, projectName, policy)
	if err != nil {
		return fmt.Errorf("failed to add policy %s: %w", projectName, err)
	}

	return err
}

func (m *MinioAdminService) DeleteProjectPolicy(ctx context.Context, projectName string) error {
	m.logger.Info("Deleting policy", "policyName", projectName)

	err := m.client.RemoveCannedPolicy(ctx, projectName)
	if err != nil {
		return fmt.Errorf("failed to remove policy %s: %w", projectName, err)
	}

	return err
}

func (m *MinioAdminService) updateProjectMembership(ctx context.Context, email, projectName string, remove bool) error {
	accessKey := m.getUserAccessKey(email)

	buckets, err := m.extractBucketsFromPolicy(ctx, accessKey)
	if err != nil {
		return err
	}

	// Add or remove project bucket from list
	if remove {
		for i, bucket := range buckets {
			if bucket == projectName {
				buckets = append(buckets[:i], buckets[i+1:]...)
				break
			}
		}
	} else {
		buckets = append(buckets, projectName)
	}

	// re-render and save the policy
	policy, err := m.renderPolicy(buckets)
	if err != nil {
		return err
	}

	err = m.client.AddCannedPolicy(ctx, accessKey, policy)
	if err != nil {
		return fmt.Errorf("failed to update policy %s: %w", accessKey, err)
	}

	// Associate user to his policy (idempotent)
	err = m.client.SetPolicy(ctx, accessKey, accessKey, false)
	if err != nil {
		return fmt.Errorf("failed associate user to his policy %s: %w", accessKey, err)
	}

	return err
}

func (m *MinioAdminService) extractBucketsFromPolicy(ctx context.Context, policyName string) ([]string, error) {
	// Retrieve existing policy
	policy, err := m.client.InfoCannedPolicyV2(ctx, policyName)
	if err != nil {
		var target madmin.ErrorResponse

		if errors.As(err, &target) && target.Code == "XMinioAdminNoSuchPolicy" {
			m.logger.Info("Previous policy not found, assuming empty.", "policyName", policyName)
			return []string{}, nil
		}

		return nil, fmt.Errorf("failed to retrieve existing policy %s: %w", policyName, err)
	}

	// Parse policy data
	var policyData map[string]interface{}
	if err := json.Unmarshal(policy.Policy, &policyData); err != nil {
		return nil, fmt.Errorf("failed to parse policy data: %w", err)
	}

	// Iterate of policy resources (assume single statement)
	bucketNames := []string{}

	statementList, ok := policyData["Statement"].([]interface{})
	if !ok || len(statementList) == 0 {
		return nil, fmt.Errorf("failed to retrieve policy statement: %w", err)
	}

	statement, ok := statementList[0].(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("failed to parse policy statement: %w", err)
	}

	resources, ok := statement["Resource"].([]interface{})
	if !ok {
		return nil, fmt.Errorf("failed to get resources from policy statement: %w", err)
	}

	for _, resource := range resources {
		var resourceStr string

		resourceStr, ok = resource.(string)
		if !ok {
			return nil, fmt.Errorf("failed to parse resource string: %w", err)
		}

		// skip resource if it contains an asterisk
		if strings.Contains(resourceStr, "*") {
			continue
		}

		// strip arn address from resource to get bucket name
		bucketName := resourceStr[len("arn:aws:s3:::"):]
		bucketNames = append(bucketNames, bucketName)
	}

	return bucketNames, nil
}

func (m *MinioAdminService) JoinProject(ctx context.Context, email, projectName string) error {
	m.logger.Info("Adding project bucket to user policy", "email", email, "projectName", projectName)

	err := m.updateProjectMembership(ctx, email, projectName, false)
	if err != nil {
		return fmt.Errorf("failed to add user %s to group %s: %w", email, projectName, err)
	}

	return nil
}

func (m *MinioAdminService) LeaveProject(ctx context.Context, email, projectName string) error {
	m.logger.Info("Removing project bucket from user policy", "email", email, "projectName", projectName)

	err := m.updateProjectMembership(ctx, email, projectName, true)
	if err != nil {
		return fmt.Errorf("failed to remove user %s from group %s: %w", email, projectName, err)
	}

	return err
}
