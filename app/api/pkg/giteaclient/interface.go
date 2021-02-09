package giteaclient

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

// GiteaClient defines all Gitea operations.
type GiteaClient interface {
	CreateUser(email, username, password string) error
	AddSSHKey(username, publicSSHKey string) error
}
