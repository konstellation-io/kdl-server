package keycloak

import "context"

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

// Service defines all Keycloak operations.
type Service interface {
	DeleteUser(ctx context.Context, userEmail string) error
}
