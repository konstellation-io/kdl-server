package user

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

import (
	"context"
	"time"

	"github.com/konstellation-io/kdl-server/app/api/entity"
)

// Repository interface to retrieve and persists users.
type Repository interface {
	EnsureIndexes() error
	Get(ctx context.Context, id string) (entity.User, error)
	GetByUsername(ctx context.Context, username string) (entity.User, error)
	GetByEmail(ctx context.Context, email string) (entity.User, error)
	GetBySub(ctx context.Context, sub string) (entity.User, error)
	Create(ctx context.Context, user entity.User) (string, error)
	UpdateAccessLevel(ctx context.Context, userIDs []string, level entity.AccessLevel) error
	UpdateSSHKey(ctx context.Context, username string, SSHKey entity.SSHKey) error
	UpdateSub(ctx context.Context, username, sub string) error
	FindAll(ctx context.Context, includeDeleted bool) ([]entity.User, error)
	FindByIDs(ctx context.Context, userIDs []string) ([]entity.User, error)
	UpdateEmail(ctx context.Context, userID, email string) error
	UpdateUsername(ctx context.Context, email, userID string) error
	UpdateDeleted(ctx context.Context, userID string, deleted bool) error
	UpdateLastActivity(ctx context.Context, userID string, lastActivity time.Time) error
	UpdateMinioAccess(ctx context.Context, username, accessKey, secretKey string) error
}

// UseCase interface to manage all operations related with users.
type UseCase interface {
	Create(ctx context.Context, email, sub string, accessLevel entity.AccessLevel) (entity.User, error)
	UpdateSub(ctx context.Context, user entity.User, sub string) (entity.User, error)
	UpdateAccessLevel(ctx context.Context, userIDs []string, level entity.AccessLevel, loggedUserID string) ([]entity.User, error)
	UpdateLastActivity(ctx context.Context, user entity.User) (entity.User, error)
	FindAll(ctx context.Context) ([]entity.User, error)
	GetByEmail(ctx context.Context, email string) (entity.User, error)
	StartTools(ctx context.Context, email string, runtimeID *string, capabilitiesID *string) (entity.User, error)
	StopTools(ctx context.Context, email string) (entity.User, error)
	AreToolsRunning(ctx context.Context, username string) (bool, error)
	IsKubeconfigActive() bool
	FindByIDs(ctx context.Context, userIDs []string) ([]entity.User, error)
	GetByID(ctx context.Context, userID string) (entity.User, error)
	RegenerateSSHKeys(ctx context.Context, user entity.User) (entity.User, error)
	GetKubeconfig(ctx context.Context, username string) (string, error)
	SyncUserData(ctx context.Context, userID string, syncSA, syncSSHKeys, syncMinio bool) error
	UpdateKDLUserTools(ctx context.Context) error
	GetUserTools(ctx context.Context, username string) (*entity.UserTools, error)
}
