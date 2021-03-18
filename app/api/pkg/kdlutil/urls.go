package kdlutil

import (
	"net/url"
	"path"
)

func JoinToURL(baseURL string, pathsToAppend ...string) (string, error) {
	u, err := url.Parse(baseURL)
	if err != nil {
		return "", err
	}

	paths := []string{u.Path}
	u.Path = path.Join(append(paths, pathsToAppend...)...)

	return u.String(), nil
}
