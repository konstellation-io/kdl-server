package entity

// RepositoryType is an enum for repository types.
type RepositoryType string

const (
	// RepositoryTypeInternal repository type.
	RepositoryTypeInternal RepositoryType = "INTERNAL"

	// RepositoryTypeExternal repository type.
	RepositoryTypeExternal RepositoryType = "EXTERNAL"
)

// IsValid checks if the type is valid.
func (e RepositoryType) IsValid() bool {
	switch e {
	case RepositoryTypeInternal, RepositoryTypeExternal:
		return true
	}

	return false
}

// String implements the fmt.Stringer interface.
func (e RepositoryType) String() string {
	return string(e)
}

// Repository entity definition.
type Repository struct {
	ID               string
	Type             RepositoryType
	URL              string
	InternalRepoName string
	Connected        bool
}
