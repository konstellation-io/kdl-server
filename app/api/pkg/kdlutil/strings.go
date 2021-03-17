package kdlutil

func IsNilOrEmpty(text *string) bool {
	return text == nil || *text == ""
}
