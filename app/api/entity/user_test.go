package entity_test

import (
	"testing"

	"github.com/konstellation-io/kdl-server/app/api/entity"
)

func TestUsernameSlug(t *testing.T) {
	u := &entity.User{
		Username: "a_test",
	}

	slug := u.UsernameSlug()

	if slug != "a-test" {
		t.Errorf("The username slug does not replace invalid `_` characters")
	}
}
