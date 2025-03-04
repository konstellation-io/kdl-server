package utils

import (
	"errors"
	"fmt"
	"os/exec"
	"regexp"

	"github.com/go-logr/logr"
)

var (
	// This regexp extracts the host name from a https URL like:
	//  https://github.com/konstellation-io/kre.git
	repoHostnameRegexp = regexp.MustCompile(`^https://([^/]+)`)

	errInvalidRepoURL = errors.New("the repository URL is invalid")
)

func isKnownHost(host string) bool {
	cmd := exec.Command("ssh-keygen", "-F", host)
	err := cmd.Run()

	return err == nil
}

func AddToKnownHost(host string, logger logr.Logger) error {
	if isKnownHost(host) {
		logger.Info("The host is already known", "host", host)
		return nil
	}

	sshKeyScanCmd := fmt.Sprintf("ssh-keyscan -H %s >> /home/kdl/.ssh/known_hosts", host)
	cmd := exec.Command("sh", "-c", sshKeyScanCmd)

	err := cmd.Run()
	if err != nil {
		return err
	}

	logger.Info("Added host to known hosts", "host", host)

	return nil
}

func GetRepoHostnameFromURL(url string) (string, error) {
	const expectedMatches = 2

	matches := repoHostnameRegexp.FindStringSubmatch(url)
	if len(matches) != expectedMatches {
		return "", errInvalidRepoURL
	}

	return matches[1], nil
}
