package giteaservice

import "github.com/konstellation-io/kdl-server/app/api/entity"

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

// GiteaClient defines all Gitea operations.
type GiteaClient interface {
	CreateUser(email, username, password string) error
	AddSSHKey(username, publicSSHKey string) error
	UpdateSSHKey(username string, publicSSHKey string) error
	UserSSHKeyExists(username string) (bool, error)
	CreateRepo(name string, ownerUsername string) error
	AddCollaborator(repoName, username string, accessLevel entity.AccessLevel) error
	RemoveCollaborator(repoName, username string) error
	UpdateCollaboratorPermissions(repoName, username string, accessLevel entity.AccessLevel) error
	MirrorRepo(url, repoName, userName, userToken string) error
}
