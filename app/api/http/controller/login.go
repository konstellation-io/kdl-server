package controller

import (
	"errors"
	"net/http"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/usecase/user"
)

// LoginController is the controller for the login endpoint.
type LoginController struct {
	userUsecase user.UseCase
}

// NewLoginController is a constructor function.
func NewLoginController(userUsecase user.UseCase) *LoginController {
	return &LoginController{
		userUsecase: userUsecase,
	}
}

func (l *LoginController) HandleLogin(w http.ResponseWriter, r *http.Request) {
	email := r.Header.Get("X-Forwarded-Email")
	sub := r.Header.Get("X-Forwarded-User")

	if email == "" || sub == "" {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	user, err := l.userUsecase.GetByEmail(r.Context(), email)
	if errors.Is(err, entity.ErrUserNotFound) {
		user, err = l.userUsecase.Create(r.Context(), email, sub, entity.AccessLevelViewer)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
	} else if user.Sub != sub {
		user, err = l.userUsecase.UpdateSub(r.Context(), user, sub)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
	}

	_, err = l.userUsecase.UpdateLastActivity(r.Context(), user)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	http.Redirect(w, r, "/", http.StatusFound)
}
