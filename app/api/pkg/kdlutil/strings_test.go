package kdlutil_test

import (
	"testing"

	"github.com/konstellation-io/kdl-server/app/api/pkg/kdlutil"
	"github.com/stretchr/testify/suite"
)

const (
	email    = "john.doe@gmail.com"
	username = "john.doe"
)

type StringTestSuite struct {
	suite.Suite
}

func TestStringTestSuite(t *testing.T) {
	suite.Run(t, new(StringTestSuite))
}

func (testSuite *StringTestSuite) TestGetUsernameFromEmailOk() {
	got := kdlutil.GetUsernameFromEmail(email)

	testSuite.Equal(username, got)
}

func (testSuite *StringTestSuite) TestGetUsernameFromEmailko() {
	got := kdlutil.GetUsernameFromEmail(username)

	testSuite.Empty(got)
}

func (testSuite *StringTestSuite) TestIsNilOrEmptyOk() {
	textStringEmpty := ""
	got := kdlutil.IsNilOrEmpty(&textStringEmpty)

	testSuite.True(got)
}

func (testSuite *StringTestSuite) TestIsNilOrEmptyKo() {
	text := username
	got := kdlutil.IsNilOrEmpty(&text)

	testSuite.False(got)
}
