package controller

import (
	"net/http"
	"regexp"

	"github.com/go-logr/logr"
	"github.com/konstellation-io/kdl-server/app/api/usecase/project"
	"github.com/konstellation-io/kdl-server/app/api/usecase/user"
)

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
		a.logger.Info("Email not found in \"X-Forwarded-Email\" header")
		res.WriteHeader(http.StatusUnauthorized)

		return
	}

	projectIDRegExp := regexp.MustCompile("^/[^/]+/(?:projects/)?([^/]+)")
	matches := projectIDRegExp.FindAllStringSubmatch(originalURI, 1)

	if !projectIDRegExp.MatchString(originalURI) {
		a.logger.Info("Project ID not found in \"X-Original-URI\" header", "originalURI", originalURI)
		res.WriteHeader(http.StatusUnauthorized)

		return
	}

	projectID := matches[0][1]

	p, err := a.projectRepo.Get(req.Context(), projectID)
	if err != nil {
		a.logger.Error(err, "HandleProjectAuth: Error getting project", "projectId", projectID)
		res.WriteHeader(http.StatusUnauthorized)

		return
	}

	u, err := a.userRepo.GetByEmail(req.Context(), email)
	if err != nil {
		a.logger.Error(err, "HandleProjectAuth: Error getting user", "email", email)
		res.WriteHeader(http.StatusUnauthorized)

		return
	}

	if !p.HasMember(u.ID) {
		a.logger.Info("HandleProjectAuth: This user is not a member of the project", "user", u.ID, "project", projectID)
		res.WriteHeader(http.StatusForbidden)

		return
	}

	res.WriteHeader(http.StatusOK)
}
