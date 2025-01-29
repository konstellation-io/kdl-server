package minioadminservice

import (
	"bytes"
	"context"
	"errors"
	"fmt"
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

func (m *MinioAdminService) CreateProjectPolicy(ctx context.Context, projectName string) error {
	tmpl, err := template.New("policy").Funcs(sprig.FuncMap()).Parse(policyTemplate)
	if err != nil {
		return fmt.Errorf("failed to parse policy template: %w", err)
	}

	var policyBuffer bytes.Buffer
	err = tmpl.Execute(&policyBuffer, struct{ BucketNames []string }{BucketNames: []string{projectName}})

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

func (m *MinioAdminService) updateProjectMembership(ctx context.Context, email, projectName string, remove bool) error {
	accessKey := m.getUserAccessKey(email)

	return m.client.UpdateGroupMembers(ctx, madmin.GroupAddRemove{
		Group:    projectName,
		IsRemove: remove,
		Members:  []string{accessKey},
	})
}

func (m *MinioAdminService) JoinProject(ctx context.Context, email, projectName string) error {
	m.logger.Info("Adding user to project group", "email", email, "projectName", projectName)

	err := m.updateProjectMembership(ctx, email, projectName, false)
	if err != nil {
		return fmt.Errorf("failed to add user %s to group %s: %w", email, projectName, err)
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

func (m *MinioAdminService) LeaveProject(ctx context.Context, email, projectName string) error {
	m.logger.Info("Removing user from project group", "email", email, "projectName", projectName)

	err := m.updateProjectMembership(ctx, email, projectName, true)
	if err != nil {
		return fmt.Errorf("failed to remove user %s from group %s: %w", email, projectName, err)
	}

	return err
}
