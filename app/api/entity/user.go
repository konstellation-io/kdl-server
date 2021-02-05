package entity

import "time"

type SSHKey struct {
	Public       string
	Private      string
	CreationDate time.Time
	LastActivity *time.Time
}

type User struct {
	ID           string
	Email        string
	CreationDate time.Time
	AccessLevel  AccessLevel
	SSHKey       SSHKey
}
