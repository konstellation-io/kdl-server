package configmap

import (
	"context"

	"github.com/go-logr/logr"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/config"
	"github.com/konstellation-io/kdl-server/app/api/infrastructure/k8s"
	"github.com/konstellation-io/kdl-server/app/api/usecase/project"
	"github.com/konstellation-io/kdl-server/app/api/usecase/user"

	v1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/watch"
)

type interactor struct {
	logger    logr.Logger
	cfg       config.Config
	k8sClient k8s.ClientInterface
	project   project.UseCase
	user      user.UseCase
}

// NewInteractor factory function.
func NewInteractor(
	logger logr.Logger,
	cfg config.Config,
	k8sClient k8s.ClientInterface,
	project project.UseCase,
	user user.UseCase,
) UseCase {
	return &interactor{
		logger:    logger,
		cfg:       cfg,
		k8sClient: k8sClient,
		project:   project,
		user:      user,
	}
}

func (i *interactor) updateCRDObjects(ctx context.Context, configMapName string) {
	if configMapName == i.k8sClient.GetConfigMapTemplateNameKDLProject() {
		err := i.project.UpdateKDLProjects(ctx)
		if err != nil {
			i.logger.Error(err, "Error updating KDLProjects")
		}
	}

	if configMapName == i.k8sClient.GetConfigMapTemplateNameKDLUserTools() {
		err := i.user.UpdateKDLUserTools(ctx)
		if err != nil {
			i.logger.Error(err, "Error updating KDLUserTools")
		}
	}
}

func (i *interactor) WatchConfigMapTemplates(ctx context.Context) error {
	watcher, err := i.k8sClient.CreateConfigMapWatcher(ctx)

	if err != nil {
		i.logger.Error(err, "Error creating watcher for ConfigMap")
		return err
	}

	defer watcher.Stop()

	// forever running
	for msg := range watcher.ResultChan() {
		if msg.Type == watch.Modified {
			configMap, assertType := msg.Object.(*v1.ConfigMap)

			if !assertType {
				i.logger.Error(err, "Error asserting ConfigMap type")
				continue
			}

			i.logger.Info("ConfigMap modified", "name", configMap.Name)
			i.updateCRDObjects(ctx, configMap.Name)
		}
	}

	return nil
}
