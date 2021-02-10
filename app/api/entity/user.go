package entity

import "time"

// SSHKey entity definition.
type SSHKey struct {
	Public       string
	Private      string
	CreationDate time.Time
	LastActivity *time.Time
}

// APIToken entity definition.
type APIToken struct {
	ID           string
	Name         string
	CreationDate string
	LastUsedDate string
	Token        string
}

// User entity definition.
type User struct {
	ID           string
	Email        string
	Username     string
	CreationDate time.Time
	AccessLevel  AccessLevel
	SSHKey       SSHKey
	LastActivity *time.Time
	APITokens    []APIToken
}
