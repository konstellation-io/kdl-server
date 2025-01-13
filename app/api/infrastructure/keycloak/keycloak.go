package keycloak

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/Nerzal/gocloak/v13"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/config"
)

var (
	ErrUserNotFound = errors.New("user not found")
)

var _ Service = (*service)(nil)

// service implements the KeycloakService interface.
type service struct {
	cfg                   config.KeycloakConfig
	client                *gocloak.GoCloak
	token                 *gocloak.JWT
	tokenExpiresAt        time.Time
	refreshTokenExpiresAt time.Time
}

// WitchClient creates a new GoCloak client with the given endpoint.
// This function helps us to also create a dynamic client for testing purposes.
func WithClient(endpoint string) *gocloak.GoCloak {
	client := gocloak.NewClient(endpoint)

	return client
}

func NewKeycloakUserRegistry(client *gocloak.GoCloak, cfg config.KeycloakConfig) (*service, error) {
	ctx := context.Background()
	now := time.Now()

	token, err := client.LoginAdmin(
		ctx,
		cfg.AdminUser,
		cfg.AdminPasswordKey,
		cfg.MasterRealm,
	)
	if err != nil {
		return nil, fmt.Errorf("login with admin user: %w", err)
	}

	return &service{
		cfg:                   cfg,
		client:                client,
		token:                 token,
		tokenExpiresAt:        now.Add(time.Duration(token.ExpiresIn) * time.Second),
		refreshTokenExpiresAt: now.Add(time.Duration(token.RefreshExpiresIn) * time.Second),
	}, nil
}

func (ur *service) refreshToken(ctx context.Context) error {
	now := time.Now()

	if now.Before(ur.tokenExpiresAt) {
		return nil
	}

	var (
		token *gocloak.JWT
		err   error
	)

	if now.Before(ur.refreshTokenExpiresAt) {
		token, err = ur.client.RefreshToken(
			ctx,
			ur.token.RefreshToken,
			ur.cfg.AdminClientID,
			"",
			ur.cfg.MasterRealm,
		)
		if err != nil {
			return fmt.Errorf("refreshing token: %w", err)
		}
	} else {
		token, err = ur.client.LoginAdmin(
			ctx,
			ur.cfg.AdminUser,
			ur.cfg.AdminPasswordKey,
			ur.cfg.MasterRealm,
		)
		if err != nil {
			return fmt.Errorf("login with admin user: %w", err)
		}
	}

	ur.token = token
	ur.tokenExpiresAt = now.Add(time.Duration(token.ExpiresIn) * time.Second)
	ur.refreshTokenExpiresAt = now.Add(time.Duration(token.RefreshExpiresIn) * time.Second)

	return nil
}

func (ur *service) DeleteUser(ctx context.Context, username string) error {
	err := ur.refreshToken(ctx)
	if err != nil {
		return err
	}

	users, err := ur.client.GetUsers(
		ctx, ur.token.AccessToken, ur.cfg.Realm,
		gocloak.GetUsersParams{Username: gocloak.StringP(username)},
	)
	if err != nil {
		return err
	}

	if len(users) == 0 {
		return ErrUserNotFound
	}

	userID := *users[0].ID

	err = ur.client.DeleteUser(ctx, ur.token.AccessToken, ur.cfg.Realm, userID)
	if err != nil {
		return fmt.Errorf("deleting Keycloak user %q: %w", userID, err)
	}

	return nil
}
