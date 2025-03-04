//go:build integration

package keycloak //nolint:testpackage // Some functions in keycloak package must remain private

import (
	"context"
	"path/filepath"
	"testing"
	"time"

	"github.com/Nerzal/gocloak/v13"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/config"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
)

const (
	_adminUser     = "admin"
	_adminPassword = "admin"
	_testUsername  = "user"
	_invalidKey    = "invalid"
)

type KeycloakSuite struct {
	suite.Suite
	cfg               config.KeycloakConfig
	keycloakContainer testcontainers.Container
	keycloakService   *ServiceImplementation
	keycloakClient    *gocloak.GoCloak
}

func TestKeycloakSuite(t *testing.T) {
	suite.Run(t, new(KeycloakSuite))
}

func (s *KeycloakSuite) SetupSuite() {
	ctx := context.Background()

	absFilePath, err := filepath.Abs("./testdata/realm-export.json")
	s.Require().NoError(err)

	req := testcontainers.ContainerRequest{
		Image: "quay.io/keycloak/keycloak:26.0",
		Cmd: []string{
			"start-dev",
			"--import-realm",
			"--verbose",
		},
		ExposedPorts: []string{"8080/tcp"},
		WaitingFor:   wait.ForLog("Listening on:"),
		Env: map[string]string{
			"KEYCLOAK_ADMIN":          _adminUser,
			"KEYCLOAK_ADMIN_PASSWORD": _adminPassword,
		},
		Files: []testcontainers.ContainerFile{
			{
				HostFilePath:      absFilePath,
				ContainerFilePath: "/opt/keycloak/data/import/realm-export.json",
				FileMode:          0o777,
			},
		},
		Mounts: testcontainers.ContainerMounts{
			{
				Source: testcontainers.GenericVolumeMountSource{
					Name: "testdata",
				},
				Target: "/opt/keycloak/data/import",
			},
		},
	}

	keycloakContainer, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: req,
		Started:          true,
	})
	s.Require().NoError(err)

	keycloakEndpoint, err := keycloakContainer.PortEndpoint(ctx, "8080/tcp", "http")
	s.Require().NoError(err)

	s.keycloakContainer = keycloakContainer

	s.keycloakClient = WithClient(keycloakEndpoint)

	s.cfg = config.KeycloakConfig{
		AdminUser:        _adminUser,
		AdminPasswordKey: _adminPassword,
		AdminClientID:    "admin-cli",
		MasterRealm:      "master",
		Realm:            "example",
		URL:              keycloakEndpoint,
	}
}

func (s *KeycloakSuite) TearDownSuite() {
	err := s.keycloakContainer.Terminate(context.Background())
	s.Require().NoError(err)
}

func (s *KeycloakSuite) SetupTest() {
	keycloakUserRegistry, err := NewKeycloakServiceImplementation(s.keycloakClient, s.cfg)
	s.Require().NoError(err)

	s.keycloakService = keycloakUserRegistry
}

func (s *KeycloakSuite) TestRefreshToken_NotExpiredToken() {
	// GIVEN the recently obtained token through setup test
	ctx := context.Background()
	expiredTimeCopy := s.keycloakService.tokenExpiresAt

	// WHEN refreshing the token
	err := s.keycloakService.refreshToken(ctx)
	s.Require().NoError(err)

	// THEN the token is not refreshed
	s.True(expiredTimeCopy.Equal(s.keycloakService.tokenExpiresAt))
}

func (s *KeycloakSuite) TestRefreshToken_ExpiredToken() {
	// GIVEN an expired token
	ctx := context.Background()
	s.keycloakService.tokenExpiresAt = time.Now().Add(-time.Hour)

	// WHEN refreshing the token
	now := time.Now()
	err := s.keycloakService.refreshToken(ctx)
	s.Require().NoError(err)

	// THEN the token is refreshed
	s.True(now.Before(s.keycloakService.tokenExpiresAt))
}

func (s *KeycloakSuite) TestRefreshToken_ExpiredRefreshToken() {
	// GIVEN both an expired token and its refresh token expired as well
	ctx := context.Background()
	s.keycloakService.tokenExpiresAt = time.Now().Add(-time.Hour)
	s.keycloakService.refreshTokenExpiresAt = time.Now().Add(-time.Hour)

	// WHEN refreshing the token
	now := time.Now()
	err := s.keycloakService.refreshToken(ctx)
	s.Require().NoError(err)

	// THEN a new token is obtained
	s.True(now.Before(s.keycloakService.tokenExpiresAt))
	s.True(now.Before(s.keycloakService.refreshTokenExpiresAt))
}

func (s *KeycloakSuite) TestRefreshToken_ExpiredTokenWithError() {
	// GIVEN an expired token
	ctx := context.Background()
	s.keycloakService.tokenExpiresAt = time.Now().Add(-time.Hour)

	// WHEN refreshing the token with invalid credentials
	s.keycloakService.token.RefreshToken = _invalidKey
	err := s.keycloakService.refreshToken(ctx)

	// THEN an error prompts
	s.Require().Error(err)
}

func (s *KeycloakSuite) TestRefreshToken_ExpiredRefreshTokenWithError() {
	// GIVEN both an expired token and its refresh token expired as well
	ctx := context.Background()
	s.keycloakService.tokenExpiresAt = time.Now().Add(-time.Hour)
	s.keycloakService.refreshTokenExpiresAt = time.Now().Add(-time.Hour)

	// WHEN refreshing the token with invalid credentials
	s.keycloakService.cfg.AdminPasswordKey = _invalidKey
	err := s.keycloakService.refreshToken(ctx)

	// THEN an error prompts
	s.Require().Error(err)

	s.keycloakService.cfg.AdminPasswordKey = _adminPassword
}

func (s *KeycloakSuite) TestDeleteUser() {
	var (
		ctx          = context.Background()
		userName     = "user-to-delete"
		userEmail    = "test@email.com"
		testPassword = "test-password"
	)

	_, err := s.keycloakClient.CreateUser(ctx, s.keycloakService.token.AccessToken, s.cfg.Realm, gocloak.User{
		Username:      gocloak.StringP(userName),
		Email:         gocloak.StringP(userEmail),
		EmailVerified: gocloak.BoolP(true),
		Enabled:       gocloak.BoolP(true),
		Credentials: &[]gocloak.CredentialRepresentation{
			{
				Value: gocloak.StringP(testPassword),
			},
		},
	})
	s.Require().NoError(err)

	users, err := s.keycloakClient.GetUsers(ctx,
		s.keycloakService.token.AccessToken,
		s.cfg.Realm,
		gocloak.GetUsersParams{Email: gocloak.StringP(userEmail)},
	)
	s.Require().NoError(err)
	s.NotEmpty(users)

	err = s.keycloakService.DeleteUser(ctx, userEmail)
	s.Require().NoError(err)

	users, err = s.keycloakClient.GetUsers(ctx,
		s.keycloakService.token.AccessToken,
		s.cfg.Realm,
		gocloak.GetUsersParams{Email: gocloak.StringP(userEmail)},
	)
	s.Require().NoError(err)
	s.Empty(users)
}

func (s *KeycloakSuite) TestDeleteUser_NotFound() {
	var (
		ctx       = context.Background()
		userEmail = "non-existing-user"
	)

	err := s.keycloakService.DeleteUser(ctx, userEmail)
	s.Require().ErrorIs(err, ErrUserNotFound)
}
