package templates

import (
	"context"
	"fmt"
	"io/ioutil"
	"os"
	"time"

	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing/object"
	"github.com/go-git/go-git/v5/plumbing/transport/ssh"
	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/config"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/k8s"
	"github.com/konstellation-io/kdl-server/app/api/pkg/kdlutil"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
)

const (
	tmplFolder = "templates/basic"
	tmplSuffix = ".tmpl" // the files with this suffix will be consider templates
)

type templating struct {
	cfg       config.Config
	logger    logging.Logger
	k8sClient k8s.Client
}

func NewTemplating(
	cfg config.Config,
	logger logging.Logger,
	k8sClient k8s.Client,
) Templating {
	return &templating{
		cfg:       cfg,
		logger:    logger,
		k8sClient: k8sClient,
	}
}

// GenerateInitialProjectContent generates the initial project files using a template pushing the content to the project
// git repository.
func (t *templating) GenerateInitialProjectContent(ctx context.Context, project entity.Project, user entity.User) error {
	// Create a tmp dir to store the template files before git pushing
	tmpDir, err := ioutil.TempDir("", "git_clone")
	if err != nil {
		return err
	}

	defer os.RemoveAll(tmpDir)

	// Get the logged user ssh key in order to push the changes using SSH
	privateSSHKey, err := t.k8sClient.GetUserSSHKeySecret(ctx, user.UsernameSlug())
	if err != nil {
		return err
	}

	auth, err := ssh.NewPublicKeys("git", privateSSHKey, "")
	if err != nil {
		return err
	}

	// We must use the internal ssh address because the https will not work
	repoURL := fmt.Sprintf("git@gitea:kdl/%s.git", project.ID)

	r, err := git.PlainClone(tmpDir, false, &git.CloneOptions{
		URL:  repoURL,
		Auth: auth,
	})

	if err != nil {
		return err
	}

	// Use the project template to generate the files
	type TemplateData struct {
		ProjectID   string
		ProjectName string
		MinioURL    string
		MLFlowURL   string
		SharedPVC   string
	}

	data := TemplateData{
		ProjectID:   project.ID,
		ProjectName: project.Name,
		MinioURL:    t.cfg.Minio.Endpoint,
		MLFlowURL:   fmt.Sprintf("http://%s-mlflow:5000", project.ID),
		SharedPVC:   fmt.Sprintf("%s-claim", t.cfg.SharedVolume.Name),
	}

	err = kdlutil.GenerateTemplate(tmplFolder, tmplSuffix, data, tmpDir)
	if err != nil {
		return err
	}

	// Stage all changes
	worktree, err := r.Worktree()
	if err != nil {
		return err
	}

	err = worktree.AddGlob(".")
	if err != nil {
		return err
	}

	// Commit changes
	_, err = worktree.Commit("Added initial project data", &git.CommitOptions{
		Author: &object.Signature{
			Name:  user.Username,
			Email: user.Email,
			When:  time.Now(),
		},
	})

	if err != nil {
		return err
	}

	// Pushing changes
	err = r.Push(&git.PushOptions{
		RemoteName: "origin",
		Auth:       auth,
	})

	if err != nil {
		return err
	}

	return nil
}
