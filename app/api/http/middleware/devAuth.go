package middleware

import (
	"context"
	"net/http"
	"os"

	"github.com/konstellation-io/kdl-server/app/api/usecase/user"
)

// DevAuthMiddleware Development purpose authentication middleware with user and email
// obtained from environment variables.
func DevAuthMiddleware(next http.Handler, _ user.UseCase) http.Handler {
	// For development environments with the Auth from environment variables
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		email := os.Getenv("KDL_ADMIN_EMAIL")

		r = r.WithContext(context.WithValue(r.Context(), LoggedUserEmailKey, email))

		next.ServeHTTP(w, r)
	})
}
