package sshhelper

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

import "github.com/konstellation-io/kdl-server/app/api/entity"

type SSHKeyGenerator interface {
	NewKeys() (entity.SSHKey, error)
}
