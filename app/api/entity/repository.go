package entity

type RepositoryType string

const (
	RepositoryTypeInternal RepositoryType = "INTERNAL"
	RepositoryTypeExternal RepositoryType = "EXTERNAL"
)

func (e RepositoryType) IsValid() bool {
	switch e {
	case RepositoryTypeInternal, RepositoryTypeExternal:
		return true
	}

	return false
}

func (e RepositoryType) String() string {
	return string(e)
}

type Repository struct {
	ID        string
	Type      RepositoryType
	URL       string
	Connected bool
}
