package giteaclient

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
	"io/ioutil"
	"log"
	"net/http"
)

// TODO get from configurations
const url = "http://gitea:3000"
const adminUser = "toolkit-admin"
const adminPassword = "a123456"

type GiteaClientHTTP struct {
	logger logging.Logger
}

// NewUser data to be returned when create a new user
type NewUser struct {
	AvatarURL    string `json:"avatar_url"`
	CreationDate string `json:"created"`
	Email        string `json:"email"`
	FullName     string `json:"full_name"`
	UserID       int    `json:"id"`
	IsAdmin      bool   `json:"is_admin"`
	Language     string `json:"language"`
	LastLogin    string `json:"last_login"`
	Login        string `json:"login"`
}

func NewGiteaClientHTTP(logger logging.Logger) *GiteaClientHTTP {
	return &GiteaClientHTTP{logger: logger}
}

func (g *GiteaClientHTTP) CreateUser(email, username, password string) (*NewUser, error) {
	payload := map[string]interface{}{
		"email":                email,
		"full_name":            username,
		"login_name":           username,
		"must_change_password": false,
		"password":             password,
		"send_notify":          false,
		"source_id":            0,
		"username":             username,
	}
	payloadData, err := json.Marshal(&payload)
	if err != nil {
		g.logger.Errorf("payload conversion error: %w \n", err)
		return nil, err
	}
	req, err := http.NewRequest("POST", fmt.Sprintf("%s/api/v1/admin/users", url), bytes.NewBuffer(payloadData))
	if err != nil {
		g.logger.Errorf("error creating user in Gitea: %w \n", err)
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	req.SetBasicAuth(adminUser, adminPassword)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		g.logger.Errorf("error with http client to create user: %w \n", err)
		return nil, err
	}

	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)

	u := &NewUser{}
	err = json.Unmarshal(body, u)

	return u, err
}
