package entity

// RepositoryAuthMethod is an enum for repository authentication method.
type RepositoryAuthMethod string

const (
	// RepositoryAuthPassword authentication method.
	RepositoryAuthPassword RepositoryAuthMethod = "PASSWORD"

	// RepositoryAuthToken authentication method.
	RepositoryAuthToken RepositoryAuthMethod = "TOKEN"
)

// IsValid checks if the auth method is valid.
func (e RepositoryAuthMethod) IsValid() bool {
	if e == RepositoryAuthPassword || e == RepositoryAuthToken {
		return true
	}

	return false
}

// String implements the fmt.Stringer interface.
func (e RepositoryAuthMethod) String() string {
	return string(e)
}

// Repository entity definition.
type Repository struct {
	URL        string
	RepoName   string
	Error      *string
	AuthMethod RepositoryAuthMethod
}
