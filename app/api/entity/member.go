package entity

import "time"

// Member entity definition.
type Member struct {
	UserID      string
	AccessLevel AccessLevel
	AddedDate   time.Time
}
