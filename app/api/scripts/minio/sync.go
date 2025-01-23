package minio

import (
	"context"

	"github.com/go-logr/logr"

	"github.com/konstellation-io/kdl-server/app/api/infrastructure/minioadminservice"
	"github.com/konstellation-io/kdl-server/app/api/pkg/kdlutil"
	"github.com/konstellation-io/kdl-server/app/api/usecase/project"
	"github.com/konstellation-io/kdl-server/app/api/usecase/user"
)

func SyncUsers(
	logger logr.Logger,
	userRepo user.Repository,
	minioAdminService minioadminservice.MinioAdminInterface,
	randomGenerator kdlutil.RandomGenerator,
) error {
	ctx := context.Background()
	// find all users in the database and create MinIO Users
	users, err := userRepo.FindAll(ctx, false)
	if err != nil {
		logger.Error(err, "Error finding all users")
		return err
	}

	for _, u := range users {
		// Generate a secret key for the Minio User
		secretKey, err := randomGenerator.GenerateRandomString(40)
		if err != nil {
			logger.Error(err, "Error creating a MinIO User secret key", "username", u.Username)
			return err
		}

		// create the User in MinIO
		accessKey, err := minioAdminService.CreateUser(ctx, u.UsernameSlug(), secretKey)
		if err != nil {
			logger.Error(err, "Error creating a MinIO User", "username", u.Username)
			return err
		}

		// Update MinIO User in database
		err = userRepo.UpdateMinioAccess(ctx, u.Username, accessKey, secretKey)
		if err != nil {
			logger.Error(err, "Error updating user with MinIO access", "username", u.Username)
			return err
		}
	}

	return nil
}

func SyncProjects(
	logger logr.Logger,
	projectRepo project.Repository,
	userRepo user.Repository,
	minioAdminService minioadminservice.MinioAdminInterface,
	randomGenerator kdlutil.RandomGenerator,
) error {
	ctx := context.Background()
	// find all projects in database and create MinIO Projects and Policies
	projects, err := projectRepo.FindAll(ctx)
	if err != nil {
		logger.Error(err, "Error finding all projects")
		return err
	}

	for _, p := range projects {
		// Create MinIO Policy for the Project
		err = minioAdminService.CreateProjectPolicy(ctx, p.ID)
		if err != nil {
			logger.Error(err, "Error creating a MinIO Project Policy", "projectID", p.ID)
			return err
		}

		// Generate a secret key for the MinIO project user
		secretKey, err := randomGenerator.GenerateRandomString(40)
		if err != nil {
			logger.Error(err, "Error creating a MinIO Project User secret key", "projectID", p.ID)
			return err
		}

		// Create MinIO Project User
		accessKey, err := minioAdminService.CreateProjectUser(ctx, p.ID, secretKey)
		if err != nil {
			logger.Error(err, "Error creating a MinIO Project User", "projectID", p.ID)
			return err
		}

		// Update Project in database
		err = projectRepo.UpdateMinioAccess(ctx, p.ID, accessKey, secretKey)
		if err != nil {
			logger.Error(err, "Error updating project with MinIO access", "projectID", p.ID)
			return err
		}

		// Join all project members to the project
		for _, member := range p.Members {
			u, err := userRepo.Get(ctx, member.UserID)
			if err != nil {
				logger.Error(err, "Error getting user", "userID", member.UserID)
				return err
			}

			err = minioAdminService.JoinProject(ctx, u.UsernameSlug(), p.ID)
			if err != nil {
				logger.Error(err, "Error joining user to project", "username", u.Username, "projectID", p.ID)
				return err
			}
		}
	}

	return nil
}
