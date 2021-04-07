package giteaservice

import (
	"github.com/konstellation-io/kdl-server/app/api/entity"
)

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

// GiteaClient defines all Gitea operations.
type GiteaClient interface {
	AddSSHKey(username, publicSSHKey string) error
	UpdateSSHKey(username string, newPublicSSHKey string) error
	CreateRepo(name string, ownerUsername string) error
	AddCollaborator(repoName, username string, accessLevel entity.AccessLevel) error
	RemoveCollaborator(repoName, username string) error
	UpdateCollaboratorPermissions(repoName, username string, accessLevel entity.AccessLevel) error
	MirrorRepo(url, repoName, userName, userToken string) error
	FindAllUsers() ([]entity.User, error)
	UpdateRepoName(oldRepoName, newRepoName string) error
}
