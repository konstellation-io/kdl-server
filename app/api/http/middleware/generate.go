package middleware

import (
	"net/http"
)

func GenerateMiddleware(devEnvironment bool) func(next http.Handler) http.Handler {
	if devEnvironment {
		return DevAuthMiddleware
	}

	return AuthMiddleware
}
