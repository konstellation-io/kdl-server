package kdlutil

import (
	"testing"

	"github.com/stretchr/testify/suite"
)

type StringTestSuite struct {
	suite.Suite
}

func TestStringTestSuite(t *testing.T) {
	suite.Run(t, new(StringTestSuite))
}

func (testSuite *StringTestSuite) TestGetUsernameFromEmailOk() {
	email := "john.doe@gmail.com"
	want := "john.doe"
	got := GetUsernameFromEmail(email)

	testSuite.Equal(want, got)
}

func (testSuite *StringTestSuite) TestGetUsernameFromEmailko() {
	email := "john.doe"
	got := GetUsernameFromEmail(email)

	testSuite.Empty(got)
}

func (testSuite *StringTestSuite) TestIsNilOrEmptyOk() {
	textStringEmpty := ""
	got := IsNilOrEmpty(&textStringEmpty)

	testSuite.True(got)
}

func (testSuite *StringTestSuite) TestIsNilOrEmptyKo() {
	text := "john.doe"
	got := IsNilOrEmpty(&text)

	testSuite.False(got)
}
