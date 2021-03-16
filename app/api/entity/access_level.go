package entity

// AccessLevel is an enum for access levels.
type AccessLevel string

const (
	// AccessLevelViewer access level.
	AccessLevelViewer AccessLevel = "VIEWER"

	// AccessLevelManager access level.
	AccessLevelManager AccessLevel = "MANAGER"

	// AccessLevelAdmin access level.
	AccessLevelAdmin AccessLevel = "ADMIN"
)

// IsValid checks if the type is valid.
func (e AccessLevel) IsValid() bool {
	switch e {
	case AccessLevelViewer, AccessLevelManager, AccessLevelAdmin:
		return true
	}

	return false
}

// String implements the fmt.Stringer interface.
func (e AccessLevel) String() string {
	return string(e)
}
