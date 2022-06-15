package entity

import (
	"time"

	"github.com/gosimple/slug"
)

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
	Deleted      bool
	CreationDate time.Time
	AccessLevel  AccessLevel
	SSHKey       SSHKey
	LastActivity *time.Time
	APITokens    []APIToken
}

func (u User) UsernameSlug() string {
	slug.CustomSub = map[string]string{
		"_": "-",
	}
	return slug.Make(u.Username)
}
