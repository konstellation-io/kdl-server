package main

import (
	"flag"
	"log"
	"os"
	"sync"
	"time"

	"cleaner/utils"
)

const defaultThreshold time.Duration = 120 * time.Hour

func main() {
	var (
		threshold time.Duration
		trashPath string
		debug     bool
	)

	flag.DurationVar(&threshold, "threshold", defaultThreshold, "The minimum age of the items to be removed.")
	flag.StringVar(&trashPath, "path", "./.trash", "Specify the root path of the trash folder to be cleaned.")
	flag.BoolVar(&debug, "debug", false, "Set debug mode to get more detailed log of deleted files.")
	flag.Parse()
	log.Printf("Start cleaning with the following values: \n - threshold = %v \n - trashPath = %v", threshold, trashPath)

	loc, _ := time.LoadLocation("UTC")
	now := time.Now().In(loc)

	// Check if trashPath exist
	if _, err := os.Stat(trashPath); os.IsNotExist(err) {
		log.Fatalf("The folder to clean does not exist: %s", err)
	}

	// Get the list of files and folders within the trashPath to be removed because fit the threshold
	itemsToRemove := utils.ListToRemove(threshold, trashPath, now)

	// Iterate the list of items to remove to remove these recursively
	var mainWaitGroup sync.WaitGroup

	for _, v := range itemsToRemove {
		mainWaitGroup.Add(1)

		go utils.RemoveTrashItem(&mainWaitGroup, v, debug)
	}

	mainWaitGroup.Wait()
}
