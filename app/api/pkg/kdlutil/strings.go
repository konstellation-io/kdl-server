package kdlutil

import (
	"regexp"

	"github.com/konstellation-io/kdl-server/app/api/entity"
)

var (
	repoNameRegexp = regexp.MustCompile(`([^/]+)\.git$`)
)

func IsNilOrEmpty(text *string) bool {
	return text == nil || *text == ""
}

// getRepoNameFromURL extracts the name of the repo from the external repo url.
func GetRepoNameFromURL(url string) (string, error) {
	const expectedMatches = 2

	matches := repoNameRegexp.FindStringSubmatch(url)
	if len(matches) != expectedMatches {
		return "", entity.ErrInvalidRepoURL
	}

	return matches[1], nil
}
