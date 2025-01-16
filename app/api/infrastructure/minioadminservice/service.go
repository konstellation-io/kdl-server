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

func (m *MinioAdminService) getUserAccessKey(userSlug string) string {
	return fmt.Sprintf("user-%s", userSlug)
}

func (m *MinioAdminService) getProjectAccessKey(projectName string) string {
	return fmt.Sprintf("project-%s", projectName)
}

func (m *MinioAdminService) CreateUser(ctx context.Context, userSlug, secretKey string) (string, error) {
	if userSlug == "" {
		return "", errEmptySlug
	}

	accessKey := m.getUserAccessKey(userSlug)

	m.logger.Info("Creating user", "userSlug", userSlug, "accessKey", accessKey)

	err := m.client.AddUser(ctx, accessKey, secretKey)
	if err != nil {
		return "", fmt.Errorf("failed to create user %s, access key %s: %w", userSlug, accessKey, err)
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

func (m *MinioAdminService) DeleteUser(ctx context.Context, userSlug string) error {
	accessKey := m.getUserAccessKey(userSlug)

	m.logger.Info("Deleting user", "userSlug", userSlug, "accessKey", accessKey)

	return m.removeUser(ctx, accessKey)
}

func (m *MinioAdminService) DeleteProjectUser(ctx context.Context, projectName string) error {
	accessKey := m.getProjectAccessKey(projectName)

	m.logger.Info("Deleting project user", "projectName", projectName, "accessKey", accessKey)

	return m.removeUser(ctx, accessKey)
}

func (m *MinioAdminService) CreateProjectPolicy(ctx context.Context, projectName string) error {
	tmpl, err := template.New("policy").Parse(policyTemplate)
	if err != nil {
		return fmt.Errorf("failed to parse policy template: %w", err)
	}

	var policyBuffer bytes.Buffer
	err = tmpl.Execute(&policyBuffer, struct{ BucketName string }{BucketName: projectName})

	if err != nil {
		return fmt.Errorf("failed to apply policy template: %w", err)
	}

	m.logger.Info("Updating policy", "projectName", projectName)

	err = m.client.AddCannedPolicy(ctx, projectName, policyBuffer.Bytes())
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

func (m *MinioAdminService) updateProjectMembership(ctx context.Context, userSlug, projectName string, remove bool) error {
	accessKey := m.getUserAccessKey(userSlug)

	return m.client.UpdateGroupMembers(ctx, madmin.GroupAddRemove{
		Group:    projectName,
		IsRemove: remove,
		Members:  []string{accessKey},
	})
}

func (m *MinioAdminService) JoinProject(ctx context.Context, userSlug, projectName string) error {
	m.logger.Info("Adding user to project group", "userSlug", userSlug, "projectName", projectName)

	err := m.updateProjectMembership(ctx, userSlug, projectName, false)
	if err != nil {
		return fmt.Errorf("failed to add user %s to group %s: %w", userSlug, projectName, err)
	}

	/* Adding group to policy. This has to be done after adding a user to group,
	because the first user creates the group itself. */
	m.logger.Info("Associating homonimous group to policy", "policyName", projectName)

	err = m.client.SetPolicy(ctx, projectName, projectName, true)
	if err != nil {
		return fmt.Errorf("failed associate group to policy %s: %w", projectName, err)
	}

	return err
}

func (m *MinioAdminService) LeaveProject(ctx context.Context, userSlug, projectName string) error {
	m.logger.Info("Removing user from project group", "userSlug", userSlug, "projectName", projectName)

	err := m.updateProjectMembership(ctx, userSlug, projectName, true)
	if err != nil {
		return fmt.Errorf("failed to remove user %s from group %s: %w", userSlug, projectName, err)
	}

	return err
}
