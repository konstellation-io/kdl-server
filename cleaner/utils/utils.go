package utils

import (
	"log"
	"os"
	"path"
	"path/filepath"
	"sync"
	"time"
)

func CheckAgeThreshold(threshold time.Duration, now time.Time, fileAge time.Time) bool {
	diff := now.Sub(fileAge)

	return diff >= threshold
}

func ListToRemove(threshold time.Duration, trashPath string, now time.Time) []string {
	var itemsToRemove []string

	trashItems, err := os.ReadDir(trashPath)
	if err != nil {
		log.Fatalf("Problems listing files within trash folder: %v", err)
	}

	for _, trashItem := range trashItems {
		info, err := trashItem.Info()
		if err != nil {
			log.Printf("Could not get info for file %s: %v", trashItem.Name(), err)

			continue
		}

		fileAge := info.ModTime()

		if CheckAgeThreshold(threshold, now, fileAge) {
			itemsToRemove = append(itemsToRemove, path.Join(trashPath, trashItem.Name()))
		}
	}

	return itemsToRemove
}

func RemoveTrashItem(waitGroup *sync.WaitGroup, itemToRemove string, debug bool) {
	err := filepath.Walk(
		itemToRemove,
		func(_ string, info os.FileInfo, err error) error {
			if err != nil {
				log.Fatalf("Error calling list files to remove: %s", err)
			}

			if !info.IsDir() {
				os.Remove(info.Name())

				if debug {
					log.Printf("File deleted: %v \n", info.Name())
				}
			}

			return nil
		},
	)
	if err != nil {
		waitGroup.Done()
		log.Fatalf("Error calling list files to remove: %s", err)
	}

	if debug {
		log.Printf("Element deleted: %v", itemToRemove)
	}

	err = os.RemoveAll(itemToRemove)
	if err != nil {
		waitGroup.Done()
		log.Fatalf("Error calling list files to remove: %s", err)
	}

	waitGroup.Done()
}
