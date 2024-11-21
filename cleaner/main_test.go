package main

import (
	"os"
	"sync"
	"testing"
	"time"

	"log"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCheckAgeThreshold(t *testing.T) {
	loc, _ := time.LoadLocation("UTC")
	now := time.Now().In(loc)

	fileAge := time.Now().Add(-48 * time.Hour)

	// Check that not list files newer than daysThreshold

	var daysThreshold time.Duration = 72 * time.Hour
	if checkAgeThreshold(daysThreshold, now, fileAge) {
		t.Error("With this threshold this file should not be set as true.")
	}

	daysThreshold = 24 * time.Hour
	if !checkAgeThreshold(daysThreshold, now, fileAge) {
		t.Error("With this threshold this file should be set as true.")
	}
}

func TestListToRemove(t *testing.T) {
	loc, _ := time.LoadLocation("UTC")
	now := time.Now().In(loc)
	trashPath := "./testdata_tmp"
	createTestFolder(t, trashPath)

	threshold := 48 * time.Hour
	assert.Len(t, listToRemove(threshold, trashPath, now), 0)

	threshold = 0 * time.Hour
	assert.Len(t, listToRemove(threshold, trashPath, now), 4)

	removeTestFolder(t, trashPath)
}

func TestRemoveTrashItem(t *testing.T) {
	trashPath := "./testdata_tmp"
	dirs := createTestFolder(t, trashPath)
	dir := dirs[0]

	defer os.RemoveAll(trashPath)

	var wg sync.WaitGroup

	wg.Add(1)

	go removeTrashItem(&wg, dir, false)
	wg.Wait()

	itemsList, err := os.ReadDir(trashPath)
	require.NoError(t, err)

	assert.Len(t, itemsList, 3)

	removeTestFolder(t, trashPath)
}

func createTestFolder(t *testing.T, trashPath string) []string {
	t.Helper()

	err := os.Mkdir(trashPath, 0777)
	if err != nil {
		t.Fatalf("Error creating testFolder: %s", err)
	}

	var tmpDir []string

	for i := 0; i < 4; i++ {
		dir, err := os.MkdirTemp(trashPath, "*")
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

func removeTestFolder(t *testing.T, trashPath string) {
	t.Helper()

	err := os.RemoveAll(trashPath)
	if err != nil {
		t.Fatalf("Error removing testFolder: %s", err)
	}
}
