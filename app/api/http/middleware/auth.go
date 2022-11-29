package middleware

import (
	"context"
	"net/http"
)

type contextKey int

const (
	LoggedUserNameKey contextKey = iota
	LoggedUserEmailKey
)

/*
AuthMiddleware gets the logged user from the incoming HTTP headers.
It sets into the context the username and the email of the logged user.
The oAuth2 proxy sets the following headers:

	X-Forwarded-Email: test@test.com
	X-Forwarded-For: 192.168.99.1, 172.17.0.4
	X-Forwarded-Host: kdlapp.kdl.192.168.99.135.nip.io
	X-Forwarded-User: toolkit-admin
	X-Request-Id: 4b0965af799c37bb1c26da5844a3308f
	X-Scheme: https
	X-Real-Ip: 192.168.99.1
	X-Forwarded-Proto: https
	X-Forwarded-Port: 443

Use LoggedUserNameKey and LoggedUserEmailKey to retrieve this values from the context.
Example:

	email := ctx.Value(middleware.LoggedUserEmailKey).(string).
*/
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		email := r.Header.Get("X-Forwarded-Email")
		username := r.Header.Get("X-Forwarded-User")

		if email == "" || username == "" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		r = r.WithContext(context.WithValue(r.Context(), LoggedUserNameKey, username))
		r = r.WithContext(context.WithValue(r.Context(), LoggedUserEmailKey, email))

		next.ServeHTTP(w, r)
	})
}
