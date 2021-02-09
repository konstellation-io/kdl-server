package entity

import "time"

// SSHKey entity definition.
type SSHKey struct {
	Public       string
	Private      string
	CreationDate time.Time
	LastActivity *time.Time
}

// User entity definition.
type User struct {
	ID           string
	Email        string
	Username     string
	CreationDate time.Time
	AccessLevel  AccessLevel
	SSHKey       SSHKey
}
