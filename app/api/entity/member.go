package entity

type AccessLevel string

const (
	AccessLevelViewer  AccessLevel = "VIEWER"
	AccessLevelManager AccessLevel = "MANAGER"
	AccessLevelAdmin   AccessLevel = "ADMIN"
)

func (e AccessLevel) IsValid() bool {
	switch e {
	case AccessLevelViewer, AccessLevelManager, AccessLevelAdmin:
		return true
	}
	return false
}

func (e AccessLevel) String() string {
	return string(e)
}

type Member struct {
	ID           string
	Email        string
	AccessLevel  AccessLevel
	AddedDate    string
	LastActivity *string
}
