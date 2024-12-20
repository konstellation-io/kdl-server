package k8s

import (
	"context"
	"fmt"

	"github.com/gosimple/slug"
	"github.com/konstellation-io/kdl-server/app/api/entity"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/apimachinery/pkg/watch"
)

// DeleteUserToolsCR removes a given user tools custom resource from Kubernetes.
func (k *Client) DeleteUserToolsCR(ctx context.Context, username string) error {
	slugUsername := k.getSlugUsername(username)
	resName := k.getUserToolsResName(slugUsername)

	var zero int64

	delPropagationFg := metav1.DeletePropagationForeground

	err := k.userToolsRes.Namespace(k.cfg.Kubernetes.Namespace).Delete(ctx, resName, metav1.DeleteOptions{
		GracePeriodSeconds: &zero,
		PropagationPolicy:  &delPropagationFg,
	})

	if err != nil {
		k.logger.Error(err, "Error deleting user tools")
		return err
	}

	result, err := k.userToolsRes.
		Namespace(k.cfg.Kubernetes.Namespace).
		Patch(ctx, resName, types.MergePatchType, []byte("{\"metadata\":{\"finalizers\":[]}}"), metav1.PatchOptions{})

	if err != nil {
		return err
	}

	k.logger.Info("Applied path to remove finalizers", "result", result.Object)

	return k.waitUserToolsDeleted(ctx, resName)
}

// CreateUserToolsCR creates the user tools Custom Resource in Kubernetes.
func (k *Client) CreateUserToolsCR(ctx context.Context, username, runtimeID, runtimeImage, runtimeTag string,
	capabilities entity.Capabilities) error {
	slugUsername := k.getSlugUsername(username)
	resName := fmt.Sprintf("usertools-%s", slugUsername)

	err := k.createUserToolsDefinition(ctx, username, slugUsername, resName, runtimeID, runtimeImage, runtimeTag, capabilities)
	if err != nil {
		return err
	}

	return k.waitUserToolsRunning(ctx, resName)
}

// IsUserToolPODRunning checks if the there is a user tool POD running for the given username.
func (k Client) IsUserToolPODRunning(ctx context.Context, username string) (bool, error) {
	pod, err := k.getUserToolsPod(ctx, username)
	if err != nil {
		return false, nil
	}

	return pod.Status.Phase == v1.PodRunning, nil
}

// getUserToolsPod returns the UserToolsPod object.
func (k Client) getUserToolsPod(ctx context.Context, username string) (v1.Pod, error) {
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
func (k Client) GetRuntimeIDFromUserTools(ctx context.Context, username string) (string, error) {
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

// GetCapabilitiesIDFromUserTools returns the capabilityId that the user tools runtime POD is using.
func (k Client) GetCapabilitiesIDFromUserTools(ctx context.Context, username string) (string, error) {
	pod, err := k.getUserToolsPod(ctx, username)
	if err != nil {
		return "", nil
	}

	labels := pod.GetLabels()
	if capability, found := labels["capabilityId"]; found {
		return capability, nil
	}

	return "", nil
}

func (k *Client) getPodListForUser(ctx context.Context, labelSelector string) (*v1.PodList, error) {
	list, err := k.clientset.CoreV1().Pods(k.cfg.Kubernetes.Namespace).List(ctx, metav1.ListOptions{
		LabelSelector: labelSelector,
	})

	if err != nil {
		return nil, err
	}

	return list, nil
}

func (k *Client) getSlugUsername(username string) string {
	return slug.Make(username)
}

func (k *Client) getUserToolsResName(slugUsername string) string {
	return fmt.Sprintf("usertools-%s", slugUsername)
}

func (k *Client) userToolsPODLabelSelector(resName string) string {
	return fmt.Sprintf("app.kubernetes.io/instance=%s", resName)
}

// createUserToolsDefinition creates a new Custom Resource of type UserTools for the given user.
func (k *Client) createUserToolsDefinition(ctx context.Context, username, usernameSlug, resName, runtimeID,
	runtimeImage, runtimeTag string, capabilities entity.Capabilities) error {
	serviceAccountName := k.getUserServiceAccountName(usernameSlug)

	ingressAnnotations, err := k.getK8sMap(k.cfg.UserToolsIngress.Annotations)
	if err != nil {
		return fmt.Errorf("error getting ingress annotations: %w", err)
	}

	definition, err := k.getUserToolsDefinition(
		ingressAnnotations,
		resName,
		username,
		usernameSlug,
		runtimeID,
		runtimeImage,
		runtimeTag,
		serviceAccountName,
		capabilities,
	)

	if err != nil {
		k.logger.Error(err, "Error building tools")
		return err
	}

	k.logger.Info("Creating users tools")
	_, err = k.userToolsRes.Namespace(k.cfg.Kubernetes.Namespace).Create(ctx, definition, metav1.CreateOptions{})

	if err != nil {
		k.logger.Error(err, "Error creating user tools")
		return err
	}

	return nil
}

func (k *Client) getUserToolsDefinition(
	ingressAnnotations map[string]interface{},
	resName, username, usernameSlug, runtimeID, runtimeImage, runtimeTag, serviceAccountName string,
	capabilities entity.Capabilities,
) (*unstructured.Unstructured, error) {
	tlsConfig := map[string]interface{}{
		"enabled": k.cfg.TLS.Enabled,
	}

	if k.cfg.UserToolsIngress.TLS.SecretName != nil {
		tlsConfig["secretName"] = &k.cfg.UserToolsIngress.TLS.SecretName
	}

	vscodeRuntime := map[string]interface{}{
		"runtimeId": runtimeID,
		"image": map[string]string{
			"repository": runtimeImage,
			"tag":        runtimeTag,
			"pullPolicy": k.cfg.UserToolsVsCodeRuntime.Image.PullPolicy,
		},
	}

	spec := map[string]interface{}{
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
			"enabled": k.cfg.VSCode.Enabled,
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
		"serviceAccountName": serviceAccountName,
	}

	err := k.loadCapabilites(spec, vscodeRuntime, capabilities)
	if err != nil {
		return nil, err
	}

	spec["vscodeRuntime"] = vscodeRuntime

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
			"spec": spec,
		},
	}

	return definition, nil
}

func (k *Client) loadCapabilites(
	spec map[string]interface{},
	vscodeRuntime map[string]interface{},
	capabilities entity.Capabilities,
) error {
	if capabilities.ID != "" {
		if err := capabilities.Validate(); err != nil {
			return err
		}

		if !capabilities.IsNodeSelectorsEmpty() {
			spec["nodeSelector"] = capabilities.GetNodeSelectors()
		}

		if !capabilities.IsTolerationsEmpty() {
			spec["tolerations"] = capabilities.GetTolerations()
		}

		if !capabilities.IsAffinitiesEmpty() {
			spec["affinity"] = capabilities.GetAffinities()
		}

		vscodeRuntime["capabilityId"] = capabilities.ID
	}

	return nil
}

// Returns a watcher for the UserTools.
func (k *Client) createUserToolsWatcher(ctx context.Context, resName string) (watch.Interface, error) {
	labelSelector := k.userToolsPODLabelSelector(resName)
	k.logger.Info("Creating watcher for POD", "label", labelSelector)

	opts := metav1.ListOptions{
		TypeMeta:      metav1.TypeMeta{},
		LabelSelector: labelSelector,
		FieldSelector: "",
	}

	return k.clientset.CoreV1().Pods(k.cfg.Kubernetes.Namespace).Watch(ctx, opts)
}

// Wait until all the resources in the Usertools CR are deleted.
func (k *Client) waitUserToolsDeleted(ctx context.Context, resName string) error {
	watcher, err := k.createUserToolsWatcher(ctx, resName)
	if err != nil {
		return err
	}

	defer watcher.Stop()

	for {
		select {
		case event := <-watcher.ResultChan():
			if event.Type == watch.Deleted {
				pod, assertType := event.Object.(*v1.Pod)
				if assertType {
					k.logger.Info("Pod deleted", "podName", pod.Name)
				}

				return nil
			}

		case <-ctx.Done():
			k.logger.Info("Exit from waitUserToolsDeleted for POD because the context is done", "podName", resName)
			return nil
		}
	}
}

// Wait until all the resources in the Usertools CR are running.
func (k *Client) waitUserToolsRunning(ctx context.Context, resName string) error {
	watcher, err := k.createUserToolsWatcher(ctx, resName)
	if err != nil {
		return err
	}

	defer watcher.Stop()

	for {
		select {
		case event := <-watcher.ResultChan():
			pod, ok := event.Object.(*v1.Pod)
			if !ok {
				k.logger.Info("Event is not a POD", "event", event)
				continue
			}

			if pod.Status.Phase == v1.PodRunning {
				k.logger.Info("The POD is running", "podName", resName)
				return nil
			}

		case <-ctx.Done():
			k.logger.Info("Exit from waitUserToolsRunning for POD because the context is done", "podName", resName)
			return nil
		}
	}
}
