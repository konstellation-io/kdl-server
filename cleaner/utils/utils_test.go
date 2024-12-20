package utils_test

import (
	"log"
	"os"
	"sync"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"cleaner/utils"
)

const (
	numberOfTempFiles = 4
	testDataPath      = "./testdata_tmp"
)

func TestCheckAgeThreshold(t *testing.T) {
	loc, err := time.LoadLocation("UTC")
	require.NoError(t, err)

	now := time.Now().In(loc)
	fileAge := time.Now().Add(-48 * time.Hour)

	daysThreshold := 72 * time.Hour
	check := utils.CheckAgeThreshold(daysThreshold, now, fileAge)
	assert.False(t, check)

	daysThreshold = 24 * time.Hour
	check = utils.CheckAgeThreshold(daysThreshold, now, fileAge)
	assert.True(t, check)
}

func TestListToRemove(t *testing.T) {
	loc, _ := time.LoadLocation("UTC")
	now := time.Now().In(loc)

	createTestFolder(t, testDataPath)

	threshold := 48 * time.Hour
	assert.Empty(t, utils.ListToRemove(threshold, testDataPath, now))

	threshold = 0 * time.Hour
	assert.Len(t, utils.ListToRemove(threshold, testDataPath, now), numberOfTempFiles)

	removeTestFolder(t, testDataPath)
}

func TestRemoveTrashItem(t *testing.T) {
	dirs := createTestFolder(t, testDataPath)
	dir := dirs[0]

	defer os.RemoveAll(testDataPath)

	var wg sync.WaitGroup

	wg.Add(1)

	go utils.RemoveTrashItem(&wg, dir, false)
	wg.Wait()

	itemsList, err := os.ReadDir(testDataPath)
	require.NoError(t, err)

	assert.Len(t, itemsList, 3)

	removeTestFolder(t, testDataPath)
}

func createTestFolder(t *testing.T, testDataPath string) []string {
	t.Helper()

	err := os.Mkdir(testDataPath, 0777)
	if err != nil {
		t.Fatalf("Error creating testFolder: %s", err)
	}

	tmpDir := make([]string, 0, numberOfTempFiles)

	for range numberOfTempFiles {
		dir, err := os.MkdirTemp(testDataPath, "*")
		if err != nil {
			log.Printf("Can not create temp dir")
		}

		_, err = os.CreateTemp(dir, "data_set_*")
		if err != nil {
			t.Fatal(err)
		}

		tmpDir = append(tmpDir, dir)
	}

	return tmpDir
}

func removeTestFolder(t *testing.T, testDataPath string) {
	t.Helper()

	err := os.RemoveAll(testDataPath)
	if err != nil {
		t.Fatalf("Error removing testFolder: %s", err)
	}
}
