package kdlutil

import "strings"

func IsNilOrEmpty(text *string) bool {
	return text == nil || *text == ""
}

func GetUsernameFromEmail(email string) string {
	atPos := strings.Index(email, "@")
	if atPos == -1 {
		return ""
	}

	return email[:atPos]
}
