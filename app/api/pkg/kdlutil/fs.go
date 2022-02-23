package kdlutil

import (
	"errors"
	"io"
	"log"
	"os"
	"path/filepath"
	"strings"
)

var (
	ErrSrcIsNotDir = errors.New("source is not a directory")
)

// WalkMatchBySuffix walks the file tree rooted at root and returns the files with for the given suffix.
func WalkMatchBySuffix(root, suffix string) ([]string, error) {
	var matches []string

	err := filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if info.IsDir() {
			return nil
		}

		if strings.HasSuffix(path, suffix) {
			matches = append(matches, path)
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return matches, nil
}

// CopyFile copies a file attempting to preserve permissions.
func CopyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}

	defer func() {
		if e := in.Close(); e != nil {
			log.Printf("CopyFile: error closing input file: %s", e)
		}
	}()

	out, err := os.Create(dst)
	if err != nil {
		return err
	}

	defer func() {
		if e := out.Close(); e != nil {
			log.Printf("CopyFile: error closing output file: %s", e)
		}
	}()

	_, err = io.Copy(out, in)
	if err != nil {
		return err
	}

	err = out.Sync()
	if err != nil {
		return err
	}

	si, err := os.Stat(src)
	if err != nil {
		return err
	}

	return os.Chmod(dst, si.Mode())
}

// CopyDirOptions specifies optional actions on dir copying.
type CopyDirOptions struct {
	// SkipSuffix can specify which files for the given suffix should be skipped, e.g. ".html"
	SkipSuffix string
}

// CopyDir recursively copies a directory tree, attempting to preserve permissions.
// Source directory must exist, destination directory is created if not exists.
// Symlinks are ignored and skipped.
func CopyDir(src, dst string, opt CopyDirOptions) error {
	src = filepath.Clean(src)
	dst = filepath.Clean(dst)

	si, err := os.Stat(src)
	if err != nil {
		return err
	}

	if !si.IsDir() {
		return ErrSrcIsNotDir
	}

	err = os.MkdirAll(dst, si.Mode())
	if err != nil {
		return err
	}

	entries, err := os.ReadDir(src)
	if err != nil {
		return err
	}

	for _, entry := range entries {
		srcPath := filepath.Join(src, entry.Name())
		dstPath := filepath.Join(dst, entry.Name())

		if entry.IsDir() {
			err = CopyDir(srcPath, dstPath, opt)
			if err != nil {
				return err
			}

			continue
		}

		if shouldSkipFile(entry, opt.SkipSuffix) {
			continue
		}

		err = CopyFile(srcPath, dstPath)
		if err != nil {
			return err
		}
	}

	return nil
}

func shouldSkipFile(fInfo os.DirEntry, skipSuffix string) bool {
	// Skip symlinks.
	if fInfo.Type()&os.ModeSymlink != 0 {
		return true
	}

	// Skip files with a given suffix
	if skipSuffix != "" && strings.HasSuffix(fInfo.Name(), skipSuffix) {
		return true
	}

	return false
}
