package main

import (
	"bytes"
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"
)

// Credentials to be returned to create a configMap.
type Credentials struct {
	ClientID     string `json:"client_id"`
	ClientSecret string `json:"client_secret"`
	ClientName   string `json:"name"`
}

func waitForGitea(ctx context.Context, cfg Config) error {
	doneCh := make(chan struct{})

	go func() {
		log.Println("Waiting for Gitea available...")

		for {
			giteaAvailable := checkGitea(ctx, cfg.Gitea.URL, cfg.Gitea.Username, cfg.Gitea.Password)
			if giteaAvailable {
				doneCh <- struct{}{}
				return
			}

			time.Sleep(10 * time.Second)
		}
	}()

	select {
	case <-doneCh:
		log.Println("Gitea is ready")
		return nil
	case <-time.After(time.Duration(cfg.Timeout) * time.Second):
		return fmt.Errorf("%w after %d seconds", ErrTimeout, cfg.Timeout)
	}
}

func createInsecureClient() *http.Client {
	transport := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true}, // #nosec G402
	}

	return &http.Client{Transport: transport}
}

func checkGitea(ctx context.Context, url, username, password string) bool {
	client := createInsecureClient()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("%s/api/v1/user", url), nil)
	if err != nil {
		log.Printf("error calling Gitea: %v \n", err)
		log.Println("Connection with Gitea fail, retrying.")

		return false
	}

	req.SetBasicAuth(username, password)

	resp, err := client.Do(req)
	if err != nil {
		log.Println(err)
		return false
	}
	defer resp.Body.Close()

	log.Printf("Gitea response status: %d \n", resp.StatusCode)

	return resp.StatusCode == http.StatusOK
}

func createOauth2Application(
	ctx context.Context,
	name string,
	redirectUris []string,
	url, username, password string,
) (*Credentials, error) {
	payload := map[string]interface{}{
		"name":          name,
		"redirect_uris": redirectUris,
	}

	payloadData, err := json.Marshal(&payload)
	if err != nil {
		log.Printf("payload conversion error: %v \n", err)
		return nil, err
	}

	oauthURL := fmt.Sprintf("%s/api/v1/user/applications/oauth2", url)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, oauthURL, bytes.NewBuffer(payloadData))
	if err != nil {
		log.Printf("error calling Gitea when creating Oauth2 Application: %s \n", err)
		log.Println("Connection with Gitea fail, retrying.")

		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.SetBasicAuth(username, password)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)

	c := &Credentials{}
	err = json.Unmarshal(body, c)

	return c, err
}
