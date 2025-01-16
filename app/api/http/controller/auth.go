package controller

import (
	"errors"
	"net/http"
	"regexp"

	"github.com/go-logr/logr"
	"github.com/konstellation-io/kdl-server/app/api/usecase/project"
	"github.com/konstellation-io/kdl-server/app/api/usecase/user"
)

var errProjectAuth = errors.New("request to auth a project failed")

type AuthController struct {
	logger      logr.Logger
	userRepo    user.Repository
	projectRepo project.Repository
}

func NewAuthController(logger logr.Logger, userRepo user.Repository, projectRepo project.Repository) *AuthController {
	return &AuthController{
		logger:      logger,
		userRepo:    userRepo,
		projectRepo: projectRepo,
	}
}

func (a *AuthController) HandleProjectAuth(res http.ResponseWriter, req *http.Request) {
	email := req.Header.Get("X-Forwarded-Email")
	originalURI := req.Header.Get("X-Original-URI")

	if email == "" {
		a.logger.Error(errProjectAuth, "Header X-Forwarded-Email is empty")
		res.WriteHeader(http.StatusUnauthorized)

		return
	}

	projectIDRegExp := regexp.MustCompile("^/[^/]+/(?:projects/)?([^/]+)")
	matches := projectIDRegExp.FindAllStringSubmatch(originalURI, 1)

	if !projectIDRegExp.MatchString(originalURI) {
		a.logger.Error(errProjectAuth, "Header X-Original-URI does not match the expected format", "X-Original-URI", originalURI)
		res.WriteHeader(http.StatusUnauthorized)

		return
	}

	projectID := matches[0][1]

	p, err := a.projectRepo.Get(req.Context(), projectID)
	if err != nil {
		a.logger.Error(err, "Get project from db", "projectId", projectID)
		res.WriteHeader(http.StatusUnauthorized)

		return
	}

	u, err := a.userRepo.GetByEmail(req.Context(), email)
	if err != nil {
		a.logger.Error(err, "Get user from db", "email", email)
		res.WriteHeader(http.StatusUnauthorized)

		return
	}

	if !p.HasMember(u.ID) {
		a.logger.Error(errProjectAuth, "User is not a member of the project", "userId", u.ID, "projectId", projectID)
		res.WriteHeader(http.StatusForbidden)

		return
	}

	res.WriteHeader(http.StatusOK)
}
