package middleware

import (
	"context"
	"errors"
	"net/http"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/pkg/kdlutil"
	"github.com/konstellation-io/kdl-server/app/api/usecase/user"
)

type contextKey int

const (
	LoggedUserEmailKey contextKey = iota
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

Use LoggedUserEmailKey to retrieve this values from the context.
Example:

	email := ctx.Value(middleware.LoggedUserEmailKey).(string).
*/
func AuthMiddleware(next http.Handler, userUsecase user.UseCase) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		email := r.Header.Get("X-Forwarded-Email")
		sub := r.Header.Get("X-Forwarded-User")

		if email == "" || sub == "" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		_, err := userUsecase.GetByEmail(r.Context(), email)
		if errors.Is(err, entity.ErrUserNotFound) {
			extractedUsername := kdlutil.GetUsernameFromEmail(email)
			if extractedUsername != "" {
				username = extractedUsername
			}

			_, err = userUsecase.Create(r.Context(), email, username, entity.AccessLevelViewer)
			if err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
		}

		r = r.WithContext(context.WithValue(r.Context(), LoggedUserNameKey, username))
		r = r.WithContext(context.WithValue(r.Context(), LoggedUserEmailKey, email))

		next.ServeHTTP(w, r)
	})
}
