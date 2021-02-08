package giteaclient

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

type GiteaClient interface {
	CreateUser(email, username, password string) (*NewUser, error)
}
