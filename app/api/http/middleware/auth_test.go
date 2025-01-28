package middleware_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/konstellation-io/kdl-server/app/api/http/middleware"

	"github.com/stretchr/testify/suite"
)

type AuthMiddlewareTestSuite struct {
	suite.Suite
}

func TestAuthMiddlewareTestSuite(t *testing.T) {
	suite.Run(t, new(AuthMiddlewareTestSuite))
}

func (ts *AuthMiddlewareTestSuite) TestAuthMiddlewareNoEmailHeader() {
	// Arrange
	handlerFunc := http.HandlerFunc(func(_ http.ResponseWriter, _ *http.Request) {})

	req := httptest.NewRequest(http.MethodGet, "/", http.NoBody)
	req.Header.Set("X-Forwarded-User", "john")
	req.Header.Set("X-Forwarded-Email", "")

	res := httptest.NewRecorder()

	authM := middleware.AuthMiddleware(handlerFunc)
	authM.ServeHTTP(res, req)

	// Assert
	ts.Equal(http.StatusUnauthorized, res.Code)
}

func (ts *AuthMiddlewareTestSuite) TestAuthMiddlewareNoUserHeader() {
	// Arrange
	handlerFunc := http.HandlerFunc(func(_ http.ResponseWriter, _ *http.Request) {})

	req := httptest.NewRequest(http.MethodGet, "/", http.NoBody)
	req.Header.Set("X-Forwarded-User", "")
	req.Header.Set("X-Forwarded-Email", "user@email.com")

	res := httptest.NewRecorder()

	authM := middleware.AuthMiddleware(handlerFunc)
	authM.ServeHTTP(res, req)

	// Assert
	ts.Equal(http.StatusUnauthorized, res.Code)
}

func (ts *AuthMiddlewareTestSuite) TestMiddlewareAuth() {
	// Arrange
	const (
		email = "user@email.com"
		sub   = "user"
	)

	// Act
	handlerFunc := http.HandlerFunc(func(_ http.ResponseWriter, r *http.Request) {
		ts.Equal(email, r.Context().Value(middleware.LoggedUserEmailKey))
	})

	req := httptest.NewRequest(http.MethodGet, "/", http.NoBody)
	req.Header.Set("X-Forwarded-Email", email)
	req.Header.Set("X-Forwarded-User", sub)

	res := httptest.NewRecorder()

	authM := middleware.AuthMiddleware(handlerFunc)
	authM.ServeHTTP(res, req)

	// Assert
	ts.Equal(http.StatusOK, res.Code)
}
