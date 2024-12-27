//go:build integration

package keycloak

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
)

type KeycloakSuite struct {
	suite.Suite
	cfg               config.KeycloakConfig
	keycloakContainer testcontainers.Container
	keycloakService   *service
	keycloakClient    *gocloak.GoCloak
}

func TestKeycloakSuite(t *testing.T) {
	suite.Run(t, new(KeycloakSuite))
}

func (s *KeycloakSuite) SetupSuite() {
	ctx := context.Background()

	absFilePath, err := filepath.Abs("./testdata")
	s.Require().NoError(err)

	// r, err := os.Open(absFilePath)
	// s.Require().NoError(err)
	// defer r.Close()

	req := testcontainers.ContainerRequest{
		Image: "quay.io/keycloak/keycloak:latest",
		Cmd: []string{
			"start-dev",
			"--import-realm",
		},
		ExposedPorts: []string{"8080/tcp"},
		WaitingFor:   wait.ForLog("Listening on:"),
		Env: map[string]string{
			"KEYCLOAK_ADMIN":          _adminUser,
			"KEYCLOAK_ADMIN_PASSWORD": _adminPassword,
		},
		Files: []testcontainers.ContainerFile{
			{
				//Reader:            r,
				HostFilePath:      absFilePath, // will be discarded internally
				ContainerFilePath: "/opt/keycloak/data/import",
				FileMode:          0o700,
			},
		},
		Mounts: testcontainers.ContainerMounts{
			{
				Source: testcontainers.GenericVolumeMountSource{
					Name: "testdata",
				},
				Target: "/opt/keycloak/data/import",
			},
			// {
			// 	Source: testcontainers.DockerBindMountSource{
			// 		HostPath: absFilePath,
			// 	},
			// 	Target: "/opt/keycloak/data/import",
			// },
		},
	}

	keycloakContainer, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: req,
		Started:          true,
	})
	s.Require().NoError(err)

	// keycloakContainer, err := keycloak.Run(ctx,
	// 	"quay.io/keycloak/keycloak:21.1",
	// 	testcontainers.WithWaitStrategy(wait.ForLog("Listening on:")),
	// 	keycloak.WithContextPath("/auth"),
	// 	keycloak.WithRealmImportFile("./testdata/realm-export.json"),
	// 	keycloak.WithAdminUsername(_adminUser),
	// 	keycloak.WithAdminPassword(_adminPassword),
	// )

	keycloakEndpoint, err := keycloakContainer.PortEndpoint(ctx, "8080/tcp", "http")
	s.Require().NoError(err)

	s.keycloakContainer = keycloakContainer

	s.keycloakClient = WithClient(keycloakEndpoint)

	s.cfg = config.KeycloakConfig{
		AdminUserKey:     _adminUser,
		AdminPasswordKey: _adminPassword,
		AdminClientIDKey: "admin-cli",
		MasterRealmKey:   "master",
		RealmKey:         "example",
		URLKey:           keycloakEndpoint,
	}
}

func (s *KeycloakSuite) TearDownSuite() {
	err := s.keycloakContainer.Terminate(context.Background())
	s.Require().NoError(err)
}

func (s *KeycloakSuite) SetupTest() {
	keycloakUserRegistry, err := NewKeycloakUserRegistry(s.keycloakClient, s.cfg)
	s.Require().NoError(err)

	s.keycloakService = keycloakUserRegistry
}

func (s *KeycloakSuite) TearDownTest() {
	ctx := context.Background()

	testUser := s.getTestUser()
	testUser.Attributes = &map[string][]string{}

	err := s.keycloakClient.UpdateUser(
		ctx,
		s.keycloakService.token.AccessToken,
		s.cfg.RealmKey,
		*testUser,
	)
	s.Require().NoError(err)

	groups, err := s.keycloakClient.GetGroups(
		ctx,
		s.keycloakService.token.AccessToken,
		s.cfg.RealmKey,
		gocloak.GetGroupsParams{},
	)
	s.Require().NoError(err)

	for _, group := range groups {
		s.keycloakClient.DeleteGroup(
			ctx,
			s.keycloakService.token.AccessToken,
			s.cfg.RealmKey,
			*group.ID,
		)
		s.Require().NoError(err)
	}

	users, err := s.keycloakClient.GetUsers(
		ctx,
		s.keycloakService.token.AccessToken,
		s.cfg.RealmKey,
		gocloak.GetUsersParams{},
	)

	s.Require().NoError(err)

	for _, user := range users {
		if *user.Username != _testUsername {
			err = s.keycloakClient.DeleteUser(
				ctx,
				s.keycloakService.token.AccessToken,
				s.cfg.RealmKey,
				*user.ID,
			)
			s.Require().NoError(err)
		}
	}
}

func (s *KeycloakSuite) getTestUser() *gocloak.User {
	users, err := s.keycloakClient.GetUsers(
		context.Background(),
		s.keycloakService.token.AccessToken,
		s.cfg.RealmKey,
		gocloak.GetUsersParams{},
	)
	s.Require().NoError(err)

	return users[0]
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
	s.keycloakService.token.RefreshToken = "invalid"
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
	s.cfg.AdminPasswordKey = "invalid"
	err := s.keycloakService.refreshToken(ctx)

	// THEN an error prompts
	s.Require().Error(err)

	s.cfg.AdminPasswordKey = _adminPassword
}

func (s *KeycloakSuite) TestDeleteUser() {
	var (
		ctx          = context.Background()
		userName     = "user-to-delete"
		testPassword = "test-password"
		groupName    = "test-group"
	)

	_, err := s.keycloakClient.CreateUser(ctx, s.keycloakService.token.AccessToken, s.cfg.RealmKey, gocloak.User{
		Username:      gocloak.StringP(userName),
		EmailVerified: gocloak.BoolP(true),
		Groups:        &[]string{groupName},
		Enabled:       gocloak.BoolP(true),
		Credentials: &[]gocloak.CredentialRepresentation{
			{
				Value: gocloak.StringP(testPassword),
			},
		},
	})
	s.Require().NoError(err)

	err = s.keycloakService.DeleteUser(ctx, userName)
	s.Require().NoError(err)

	users, err := s.keycloakClient.GetUsers(ctx,
		s.keycloakService.token.AccessToken,
		s.cfg.RealmKey,
		gocloak.GetUsersParams{Username: gocloak.StringP(userName)},
	)
	s.Require().NoError(err)
	s.Empty(users)
}
