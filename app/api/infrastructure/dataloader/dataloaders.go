package dataloader

import (
	"context"
	"net/http"
	"time"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/usecase/user"
)

type contextKey int

const (
	loadersKey contextKey = iota
)

type Loaders struct {
	UserByID UserLoader
}

func Middleware(users user.Repository, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := context.WithValue(r.Context(), loadersKey, &Loaders{
			UserByID: UserLoader{
				maxBatch: 100,
				wait:     1 * time.Millisecond,
				fetch: func(ids []string) ([]entity.User, []error) {
					users, err := users.FindByIDs(r.Context(), ids)
					if err != nil {
						return nil, []error{err}
					}

					// The result array must preserve the order of the keys arrays
					result := make([]entity.User, len(ids))
					for idx, userID := range ids {
						var foundUser entity.User
						for _, u := range users {
							if u.ID == userID {
								foundUser = u
								break
							}
						}
						result[idx] = foundUser
					}

					return result, nil
				},
			},
		})
		r = r.WithContext(ctx)
		next.ServeHTTP(w, r)
	})
}

func For(ctx context.Context) *Loaders {
	return ctx.Value(loadersKey).(*Loaders)
}
