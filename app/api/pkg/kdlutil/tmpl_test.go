package kdlutil_test

import (
	"fmt"
	"os"
	"path/filepath"
	"testing"

	"github.com/konstellation-io/kdl-server/app/api/pkg/kdlutil"
	"github.com/stretchr/testify/require"
)

func TestGenerateTemplate(t *testing.T) {
	const tmplSuffix = ".tmpl"

	tmplFolder, err := os.MkdirTemp("", "tmpl_example")
	if err != nil {
		t.Fatal(err)
	}

	defer os.RemoveAll(tmplFolder)

	dest, err := os.MkdirTemp("", "tmpl_example_dest")
	if err != nil {
		t.Fatal(err)
	}

	defer os.RemoveAll(dest)

	content := []byte("The counter value is {{ .Counter }}")

	err = os.MkdirAll(filepath.Join(tmplFolder, "subdir1", "subdir2"), os.ModePerm)
	if err != nil {
		t.Fatal(err)
	}

	tmpfn := filepath.Join(tmplFolder, "subdir1", "subdir2", "tmpfile.txt.tmpl")
	if err := os.WriteFile(tmpfn, content, 0600); err != nil {
		t.Fatal(err)
	}

	type Data struct {
		Counter int
	}

	data := Data{Counter: 43}

	err = kdlutil.GenerateTemplate(tmplFolder, tmplSuffix, data, dest)
	require.NoError(t, err)

	destFilePath := filepath.Join(dest, "subdir1", "subdir2", "tmpfile.txt")

	destFileContent, err := os.ReadFile(destFilePath)
	if err != nil {
		t.Fatal(err)
	}

	expectedContent := []byte(fmt.Sprintf("The counter value is %d", data.Counter))
	require.Equal(t, expectedContent, destFileContent)
}
