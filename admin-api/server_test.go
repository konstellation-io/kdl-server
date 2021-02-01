package main

import "testing"

func TestServer(t *testing.T) {
	n := server(3)
	if n != 3 {
		t.Error("Value expected 3")
	}
}
