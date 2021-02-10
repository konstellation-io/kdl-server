package sshhelper

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

import "github.com/konstellation-io/kdl-server/app/api/entity"

// SSHKeyGenerator define all functions to manage SSH keys.
type SSHKeyGenerator interface {
	NewKeys() (entity.SSHKey, error)
}
