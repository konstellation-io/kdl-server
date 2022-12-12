package k8s

import (
	"context"
	"fmt"

	"github.com/gosimple/slug"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/apimachinery/pkg/watch"
)

// DeleteUserToolsCR removes the Custom Resource from Kubernetes.
func (k *k8sClient) DeleteUserToolsCR(ctx context.Context, username string) error {
	slugUsername := k.getSlugUsername(username)
	resName := k.getUserToolsResName(slugUsername)

	var zero int64 = 0

	delPropagationFg := metav1.DeletePropagationForeground

	err := k.userToolsRes.Namespace(k.cfg.Kubernetes.Namespace).Delete(ctx, resName, metav1.DeleteOptions{
		GracePeriodSeconds: &zero,
		PropagationPolicy:  &delPropagationFg,
	})

	if err != nil {
		return err
	}

	result, err := k.userToolsRes.
		Namespace(k.cfg.Kubernetes.Namespace).
		Patch(ctx, resName, types.MergePatchType, []byte("{\"metadata\":{\"finalizers\":[]}}"), metav1.PatchOptions{})

	if err != nil {
		return err
	}

	k.logger.Infof("Apply path to remove finalizers result: %s", result.Object)

	return k.waitUserToolsDeleted(ctx, resName)
}

// CreateUserToolsCR creates the user tools Custom Resource in Kubernetes.
func (k *k8sClient) CreateUserToolsCR(ctx context.Context, username, runtimeID, runtimeImage, runtimeTag string) error {
	slugUsername := k.getSlugUsername(username)
	resName := fmt.Sprintf("usertools-%s", slugUsername)

	err := k.checkOrCreateToolsSecrets(ctx, slugUsername)
	if err != nil {
		return err
	}

	k.logger.Info("UserTools secrets created")

	err = k.createUserToolsDefinition(ctx, username, slugUsername, resName, runtimeID, runtimeImage, runtimeTag)
	if err != nil {
		return err
	}

	return k.waitUserToolsRunning(ctx, resName)
}

// IsUserToolPODRunning checks if the there is a user tool POD running for the given username.
func (k k8sClient) IsUserToolPODRunning(ctx context.Context, username string) (bool, error) {
	pod, err := k.getUserToolsPod(ctx, username)
	if err != nil {
		return false, nil
	}

	return pod.Status.Phase == v1.PodRunning, nil
}

// getUserToolsPod returns the UserToolsPod object.
func (k k8sClient) getUserToolsPod(ctx context.Context, username string) (v1.Pod, error) {
	slugUsername := k.getSlugUsername(username)
	resName := k.getUserToolsResName(slugUsername)
	labelSelector := k.userToolsPODLabelSelector(resName)

	list, err := k.getPodListForUser(ctx, labelSelector)
	if err != nil {
		return v1.Pod{}, err
	}

	if len(list.Items) < 1 {
		return v1.Pod{}, nil
	}

	return list.Items[0], nil
}

// GetRuntimeIDFromUserTools returns the runtimeId that the user tools runtime POD is using.
func (k k8sClient) GetRuntimeIDFromUserTools(ctx context.Context, username string) (string, error) {
	pod, err := k.getUserToolsPod(ctx, username)
	if err != nil {
		return "", nil
	}

	labels := pod.GetLabels()
	if runtimeID, found := labels["runtimeId"]; found {
		return runtimeID, nil
	}

	return "", nil
}

func (k *k8sClient) getPodListForUser(ctx context.Context, labelSelector string) (*v1.PodList, error) {
	list, err := k.clientset.CoreV1().Pods(k.cfg.Kubernetes.Namespace).List(ctx, metav1.ListOptions{
		LabelSelector: labelSelector,
	})

	if err != nil {
		return nil, err
	}

	return list, nil
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
func (k *k8sClient) checkOrCreateToolsSecrets(ctx context.Context, slugUsername string) error {

	secretName := fmt.Sprintf("codeserver-oauth2-secrets-%s", slugUsername)
	credentialsSecretName := fmt.Sprintf("codeserver-oauth2-credentials-%s", slugUsername)

	exist, err := k.isSecretPresent(ctx, secretName)
	if err != nil {
		return fmt.Errorf("check codeserver tool secret: %w", err)
	}

	if exist {
		return nil
	}

	oAuthName := fmt.Sprintf("codeserver-app-%s", slugUsername)

	protocol := "http"
	if k.cfg.TLS.Enabled {
		protocol = "https"
	}

	callbackURL := fmt.Sprintf("%s://%s-code.%s/oauth2/callback", protocol, slugUsername, k.cfg.BaseDomainName)
	data := map[string]string{}
	data["DEPLOYMENT_SECRET_NAME"] = credentialsSecretName
	data["GITEA_REDIRECT_URIS"] = callbackURL
	data["GITEA_APPLICATION_NAME"] = oAuthName

	err = k.CreateSecret(ctx, secretName, data)
	if err != nil {
		return fmt.Errorf("creating codeserver tool secrets: %w", err)
	}

	return nil
}

// createUserToolsDefinition creates a new Custom Resource of type UserTools for the given user.
func (k *k8sClient) createUserToolsDefinition(ctx context.Context, username, usernameSlug, resName, runtimeID,
	runtimeImage, runtimeTag string) error {
	serviceAccountName := k.getUserServiceAccountName(usernameSlug)

	ingressAnnotations, err := k.getK8sMap(k.cfg.UserToolsIngress.Annotations)
	if err != nil {
		return fmt.Errorf("error getting ingress annotations: %w", err)
	}

	definition := k.getUserToolsDefinition(
		ingressAnnotations,
		resName,
		username,
		usernameSlug,
		runtimeID,
		runtimeImage,
		runtimeTag,
		serviceAccountName,
	)

	k.logger.Infof("Creating users tools: %#v", definition.Object)
	_, err = k.userToolsRes.Namespace(k.cfg.Kubernetes.Namespace).Create(ctx, definition, metav1.CreateOptions{})

	return err
}

func (k *k8sClient) getUserToolsDefinition(
	ingressAnnotations map[string]interface{},
	resName, username, usernameSlug, runtimeID, runtimeImage, runtimeTag, serviceAccountName string,
) *unstructured.Unstructured {
	tlsConfig := map[string]interface{}{
		"enabled": k.cfg.TLS.Enabled,
	}

	if k.cfg.UserToolsIngress.TLS.SecretName != nil {
		tlsConfig["secretName"] = &k.cfg.UserToolsIngress.TLS.SecretName
	}

	definition := &unstructured.Unstructured{
		Object: map[string]interface{}{
			"kind":       "UserTools",
			"apiVersion": userToolsAPIVersion,
			"metadata": map[string]interface{}{
				"name":      resName,
				"namespace": k.cfg.Kubernetes.Namespace,
				"labels": map[string]interface{}{
					"app": resName,
				},
			},
			"spec": map[string]interface{}{
				"domain": k.cfg.BaseDomainName,
				"ingress": map[string]interface{}{
					"annotations": ingressAnnotations,
					"className":   k.cfg.UserToolsIngress.ClassName,
				},
				"username":     username,
				"usernameSlug": usernameSlug,
				"storage": map[string]string{
					"size":      k.cfg.Storage.Size,
					"className": k.cfg.Storage.ClassName,
				},
				"sharedVolume": map[string]string{
					"name": k.cfg.SharedVolume.Name,
				},
				"tls": tlsConfig,
				"vscode": map[string]interface{}{
					"image": map[string]string{
						"repository": k.cfg.VSCode.Image.Repository,
						"tag":        k.cfg.VSCode.Image.Tag,
						"pullPolicy": k.cfg.VSCode.Image.PullPolicy,
					},
				},
				"repoCloner": map[string]interface{}{
					"image": map[string]string{
						"repository": k.cfg.RepoCloner.Image.Repository,
						"tag":        k.cfg.RepoCloner.Image.Tag,
						"pullPolicy": k.cfg.RepoCloner.Image.PullPolicy,
					},
					"mongodbURI": k.cfg.MongoDB.URI,
				},
				"giteaOauth2Setup": map[string]interface{}{
					"image": map[string]string{
						"repository": k.cfg.UserToolsGiteaOAuth2Setup.Image.Repository,
						"tag":        k.cfg.UserToolsGiteaOAuth2Setup.Image.Tag,
						"pullPolicy": k.cfg.UserToolsGiteaOAuth2Setup.Image.PullPolicy,
					},
					"giteaAdminSecret":     k.cfg.UserToolsGiteaOAuth2Setup.GiteaAdminSecret,
					"giteaOauth2Configmap": k.cfg.UserToolsGiteaOAuth2Setup.GiteaOauth2Configmap,
				},
				"oauth2Proxy": map[string]interface{}{
					"image": map[string]string{
						"repository": k.cfg.UserToolsOAuth2Proxy.Image.Repository,
						"tag":        k.cfg.UserToolsOAuth2Proxy.Image.Tag,
						"pullPolicy": k.cfg.UserToolsOAuth2Proxy.Image.PullPolicy,
					},
				},
				"kubeconfig": map[string]interface{}{
					"enabled":           k.cfg.UserToolsKubeconfig.Enabled,
					"externalServerUrl": k.cfg.UserToolsKubeconfig.ExternalServerURL,
				},
				"vscodeRuntime": map[string]interface{}{
					"runtimeId": runtimeID,
					"image": map[string]string{
						"repository": runtimeImage,
						"tag":        runtimeTag,
						"pullPolicy": k.cfg.UserToolsVsCodeRuntime.Image.PullPolicy,
					},
				},
				"serviceAccountName": serviceAccountName,
			},
		},
	}

	return definition
}

// Returns a watcher for the UserTools.
func (k *k8sClient) createUserToolsWatcher(ctx context.Context, resName string) (watch.Interface, error) {
	labelSelector := k.userToolsPODLabelSelector(resName)
	k.logger.Debugf("Creating watcher for POD with label: %s", labelSelector)

	opts := metav1.ListOptions{
		TypeMeta:      metav1.TypeMeta{},
		LabelSelector: labelSelector,
		FieldSelector: "",
	}

	return k.clientset.CoreV1().Pods(k.cfg.Kubernetes.Namespace).Watch(ctx, opts)
}

// Wait until all the resources in the Usertools CR are deleted.
func (k *k8sClient) waitUserToolsDeleted(ctx context.Context, resName string) error {
	watcher, err := k.createUserToolsWatcher(ctx, resName)
	if err != nil {
		return err
	}

	defer watcher.Stop()

	for {
		select {
		case event := <-watcher.ResultChan():
			if event.Type == watch.Deleted {
				pod := event.Object.(*v1.Pod)
				k.logger.Infof("Pod %s has being deleted", pod.Name)

				return nil
			}

		case <-ctx.Done():
			k.logger.Debugf("Exit from waitUserToolsDeleted for POD \"%s\" because the context is done", resName)
			return nil
		}
	}
}

// Wait until all the resources in the Usertools CR are running.
func (k *k8sClient) waitUserToolsRunning(ctx context.Context, resName string) error {
	watcher, err := k.createUserToolsWatcher(ctx, resName)
	if err != nil {
		return err
	}

	defer watcher.Stop()

	for {
		select {
		case event := <-watcher.ResultChan():
			pod := event.Object.(*v1.Pod)

			if pod.Status.Phase == v1.PodRunning {
				k.logger.Infof("The POD \"%s\" is running", resName)
				return nil
			}

		case <-ctx.Done():
			k.logger.Debugf("Exit from waitUserToolsRunning for POD \"%s\" because the context is done", resName)
			return nil
		}
	}
}
