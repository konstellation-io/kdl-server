package k8s

import (
	"context"
	"fmt"
	"strings"

	v1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/apimachinery/pkg/watch"

	"github.com/gosimple/slug"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
)

// DeleteUserToolsCR removes the Custom Resource from Kubernetes.
func (k *k8sClient) DeleteUserToolsCR(ctx context.Context, username string) error {
	slugUsername := k.getSlugUsername(username)
	resName := k.getUserToolsResName(slugUsername)

	var zero int64 = 0

	delPropagationFg := metav1.DeletePropagationForeground

	err := k.codeClient.Namespace(k.cfg.Kubernetes.Namespace).Delete(resName, &metav1.DeleteOptions{
		GracePeriodSeconds: &zero,
		PropagationPolicy:  &delPropagationFg,
	})

	if err != nil {
		return err
	}

	result, err := k.codeClient.
		Namespace(k.cfg.Kubernetes.Namespace).
		Patch(resName, types.MergePatchType, []byte("{\"metadata\":{\"finalizers\":[]}}"), metav1.PatchOptions{})

	if err != nil {
		return err
	}

	k.logger.Infof("Apply path to remove finalizers result: %s", result.Object)

	return k.waitUserToolsDeleted(ctx, resName)
}

// CreateUserToolsCR creates the user tools Custom Resource in Kubernetes.
func (k *k8sClient) CreateUserToolsCR(ctx context.Context, username string) error {
	slugUsername := k.getSlugUsername(username)
	resName := fmt.Sprintf("usertools-%s", slugUsername)

	err := k.checkOrCreateToolsSecrets(slugUsername)
	if err != nil {
		return err
	}

	k.logger.Info("UserTools secrets created")

	err = k.createUserToolsDefinition(username, slugUsername, resName)
	if err != nil {
		return err
	}

	return k.waitUserToolsRunning(ctx, resName)
}

// IsUserToolPODRunning checks if the there is a user tool POD running for the given username.
func (k k8sClient) IsUserToolPODRunning(username string) (bool, error) {
	slugUsername := k.getSlugUsername(username)
	resName := k.getUserToolsResName(slugUsername)
	labelSelector := k.userToolsPODLabelSelector(resName)

	list, err := k.clientset.CoreV1().Pods(k.cfg.Kubernetes.Namespace).List(metav1.ListOptions{
		LabelSelector: labelSelector,
	})

	if err != nil {
		return false, err
	}

	if len(list.Items) < 1 {
		return false, nil
	}

	pod := list.Items[0]

	return pod.Status.Phase == v1.PodRunning, nil
}

func (k *k8sClient) getSlugUsername(username string) string {
	return slug.Make(username)
}

func (k *k8sClient) getUserToolsResName(slugUsername string) string {
	return fmt.Sprintf("usertools-%s", slugUsername)
}

func (k *k8sClient) userToolsPODLabelSelector(resName string) string {
	return fmt.Sprintf("app.kubernetes.io/instance=%s", resName)
}

// checkOrCreateToolsSecrets set ClientID and ClientSecret on Kubernetes secret objects.
func (k *k8sClient) checkOrCreateToolsSecrets(slugUsername string) error {
	err := k.createToolSecret(slugUsername, "codeserver", "code")
	if err != nil {
		return err
	}

	return k.createToolSecret(slugUsername, "jupyter", "jupyter")
}

func (k *k8sClient) createToolSecret(slugUsername, toolName, toolURLName string) error {
	secretName := fmt.Sprintf("%s-oauth2-secrets-%s", toolName, slugUsername)

	exist, err := k.IsSecretPresent(secretName)
	if err != nil {
		return fmt.Errorf("check %s tool secret: %w", toolName, err)
	}

	if exist {
		return nil
	}

	upperToolName := strings.ToUpper(toolName)
	oAuthName := fmt.Sprintf("%s-app-%s", toolName, slugUsername)

	protocol := "http"
	if k.cfg.TLS {
		protocol = "https"
	}

	callbackURL := fmt.Sprintf("%s://%s-%s.%s/oauth2/callback", protocol, slugUsername, toolURLName, k.cfg.BaseDomainName)
	data := map[string]string{}
	data["DEPLOYMENT_SECRET_NAME"] = secretName
	data["OAUTH2_CREDENTIALS_PREFIX"] = upperToolName
	data["GITEA_REDIRECT_URIS"] = callbackURL
	data["GITEA_APPLICATION_NAME"] = oAuthName
	data[upperToolName+"_OAUTH2_CALLBACK_URL"] = callbackURL
	data[upperToolName+"_OAUTH2_INITIALIZED"] = "no"

	err = k.CreateSecret(secretName, data)
	if err != nil {
		return fmt.Errorf("creating %s tool secrets: %w", toolName, err)
	}

	return nil
}

// createUserToolsDefinition creates a new Custom Resource of type UserTools for the given user.
func (k *k8sClient) createUserToolsDefinition(username, slugUsername, resName string) error {
	definition := &unstructured.Unstructured{
		Object: map[string]interface{}{
			"kind":       "UserTools",
			"apiVersion": apiVersion,
			"metadata": map[string]interface{}{
				"name":      resName,
				"namespace": k.cfg.Kubernetes.Namespace,
				"labels": map[string]interface{}{
					"app": resName,
				},
			},
			"spec": map[string]interface{}{
				"domain": k.cfg.BaseDomainName,
				"ingress": map[string]string{
					"type": k.cfg.VSCode.Ingress.Type,
				},
				"username":     username,
				"usernameSlug": slugUsername,
				"storage": map[string]string{
					"size":      k.cfg.Storage.Size,
					"className": k.cfg.Storage.ClassName,
				},
				"sharedVolume": map[string]string{
					"name": k.cfg.VSCode.SharedVolume.Name,
				},
				"tls": k.cfg.TLS,
				"kdl": map[string]interface{}{
					"enabled": true,
				},
			},
		},
	}

	k.logger.Infof("Creating users tools: %#v", definition.Object)
	_, err := k.codeClient.Namespace(k.cfg.Kubernetes.Namespace).Create(definition, metav1.CreateOptions{})

	return err
}

func (k *k8sClient) createUserToolsWatcher(resName string) (watch.Interface, error) {
	labelSelector := k.userToolsPODLabelSelector(resName)
	k.logger.Debugf("Creating watcher for POD with label: %s", labelSelector)

	opts := metav1.ListOptions{
		TypeMeta:      metav1.TypeMeta{},
		LabelSelector: labelSelector,
		FieldSelector: "",
	}

	return k.clientset.CoreV1().Pods(k.cfg.Kubernetes.Namespace).Watch(opts)
}

func (k *k8sClient) waitUserToolsDeleted(ctx context.Context, resName string) error {
	watcher, err := k.createUserToolsWatcher(resName)
	if err != nil {
		return err
	}

	defer watcher.Stop()

	for {
		select {
		case event := <-watcher.ResultChan():
			if event.Type == watch.Deleted {
				k.logger.Debugf("The POD \"%s\" is deleted", resName)

				return nil
			}

		case <-ctx.Done():
			k.logger.Debugf("Exit from waitUserToolsDeleted for POD \"%s\" because the context is done", resName)
			return nil
		}
	}
}

func (k *k8sClient) waitUserToolsRunning(ctx context.Context, resName string) error {
	watcher, err := k.createUserToolsWatcher(resName)
	if err != nil {
		return err
	}

	defer watcher.Stop()

	for {
		select {
		case event := <-watcher.ResultChan():
			pod := event.Object.(*v1.Pod)

			if pod.Status.Phase == v1.PodRunning {
				k.logger.Debugf("The POD \"%s\" is running", resName)
				watcher.Stop()

				return nil
			}

		case <-ctx.Done():
			k.logger.Debugf("Exit from waitUserToolsRunning for POD \"%s\" because the context is done", resName)
			return nil
		}
	}
}
