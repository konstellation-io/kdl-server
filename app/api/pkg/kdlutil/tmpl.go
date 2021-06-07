package kdlutil

import (
	"os"
	"path"
	"strings"
	"text/template"
)

// GenerateTemplate copies the tmplFolder files to the dest folder parsing the template files and applying the data values.
func GenerateTemplate(tmplFolder, tmplSuffix string, data interface{}, dest string) error {
	tmplFolder = path.Clean(tmplFolder)
	dest = path.Clean(dest)

	// Copy all files but templates
	err := CopyDir(tmplFolder, dest, CopyDirOptions{
		SkipSuffix: tmplSuffix,
	})
	if err != nil {
		return err
	}

	// Get all template paths
	tmplFiles, err := WalkMatchBySuffix(tmplFolder, tmplSuffix)
	if err != nil {
		return err
	}

	for _, tmplPath := range tmplFiles {
		t, err := template.ParseFiles(tmplPath)
		if err != nil {
			return err
		}

		// Get the destination path for the current template changing
		// the input with the output folder and removing the template suffix.
		// e.g. /input/folder/file.md.tmpl -> /output/folder/file.md
		destPath := strings.Replace(tmplPath, tmplFolder, "", 1)
		destPath = strings.Replace(destPath, tmplSuffix, "", 1)
		destPath = path.Join(dest, destPath)

		destFile, err := os.Create(destPath)
		if err != nil {
			return err
		}

		// Apply a parsed template to the specified data object and write the output in destFile.
		err = t.Execute(destFile, data)
		if err != nil {
			return err
		}
	}

	return nil
}
