package giteaclient

import (
	"crypto/tls"
	"errors"
	"fmt"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
	"log"
	"net/http"
)

// TODO get from configurations
const url = "http://gitea:3000"
const user = "toolkit-admin"
const password = "a123456"

type GiteaClientHTTP struct {
	logger logging.Logger
}

func NewGiteaClientHTTP(logger logging.Logger) *GiteaClientHTTP {
	return &GiteaClientHTTP{logger: logger}
}

func (g *GiteaClientHTTP) CreateUser(email string) error {
	check := checkGitea(url, user, password)
	g.logger.Infof("gitea check[%t]", check)

	g.logger.Errorf("User[%s] cannot be created", email)
	return errors.New("gitea create client not implemented")
}

func checkGitea(url, username, password string) bool {
	http.DefaultTransport.(*http.Transport).TLSClientConfig = &tls.Config{InsecureSkipVerify: true}
	req, err := http.NewRequest("GET", fmt.Sprintf("%s/api/v1/user", url), nil)
	if err != nil {
		log.Printf("error calling Gitea: %s", err)
		log.Println("Connection with Gitea fail, retrying.")
		return false
	}
	req.SetBasicAuth(username, password)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Println(err)
		return false
	}
	log.Printf("Gitea response status: %d \n", resp.StatusCode)

	return resp.StatusCode == http.StatusOK

}
