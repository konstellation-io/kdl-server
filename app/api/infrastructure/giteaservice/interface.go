package giteaservice

import (
	"github.com/konstellation-io/kdl-server/app/api/entity"
)

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

// GiteaClient defines all Gitea operations.
type GiteaClient interface {
	AddSSHKey(username, publicSSHKey string) error
	UpdateSSHKey(username string, newPublicSSHKey string) error
	AddCollaborator(repoName, username string, accessLevel entity.AccessLevel) error
	RemoveCollaborator(repoName, username string) error
	UpdateCollaboratorPermissions(repoName, username string, accessLevel entity.AccessLevel) error
	UpdateUserPermissions(username string, level entity.AccessLevel) error
	MirrorRepo(url, repoName, userName, ownerUsername string, authMethod entity.RepositoryAuthMethod, userCredential string) error
	FindAllUsers() ([]entity.User, error)
}
