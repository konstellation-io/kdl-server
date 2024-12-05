package middleware

import (
	"net/http"

	"github.com/konstellation-io/kdl-server/app/api/usecase/user"
)

func GenerateMiddleware(devEnvironment bool) func(next http.Handler, userUsecase user.UseCase) http.Handler {
	if devEnvironment {
		return DevAuthMiddleware
	}

	return AuthMiddleware
}
