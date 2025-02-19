package k8s

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/gosimple/slug"
	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/pkg/kdlutil"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/apimachinery/pkg/watch"
)

type UserToolsData struct {
	Username       string                `json:"username"`
	SlugUsername   string                `json:"slugUsername"`
	RuntimeID      string                `json:"runtimeID"`
	RuntimeImage   string                `json:"runtimeImage"`
	RuntimeTag     string                `json:"runtimeTag"`
	Capabilities   entity.Capabilities   `json:"capabilities"`
	MinioAccessKey entity.MinioAccessKey `json:"minioAccessKey"`
}

func (k *Client) userToolsDataToMap(data UserToolsData) map[string]interface{} {
	return map[string]interface{}{
		"username":       data.Username,
		"slugUsername":   data.SlugUsername,
		"runtimeID":      data.RuntimeID,
		"runtimeImage":   data.RuntimeImage,
		"runtimeTag":     data.RuntimeTag,
		"capabilities":   data.Capabilities,
		"minioAccessKey": data.MinioAccessKey,
	}
}

func (k *Client) mapToUserToolsData(data map[string]interface{}) (UserToolsData, error) {
	jsonData, err := json.Marshal(data)
	if err != nil {
		k.logger.Info("inputData cannot be marshal to json")
		return UserToolsData{}, errCRDCantDecodeInputData
	}

	var userTool UserToolsData
	err = json.Unmarshal(jsonData, &userTool)

	if err != nil {
		k.logger.Info("inputData cannot be converted to unmarshal to UserToolsData")
		return UserToolsData{}, errCRDCantDecodeInputData
	}

	return userTool, nil
}

// DeleteUserToolsCR removes a given user tools custom resource from Kubernetes.
func (k *Client) DeleteUserToolsCR(ctx context.Context, username string) error {
	slugUsername := k.getSlugUsername(username)
	resName := k.getUserToolsResName(slugUsername)

	var zero int64

	delPropagationFg := metav1.DeletePropagationForeground

	err := k.kdlUserToolsRes.Namespace(k.cfg.Kubernetes.Namespace).Delete(ctx, resName, metav1.DeleteOptions{
		GracePeriodSeconds: &zero,
		PropagationPolicy:  &delPropagationFg,
	})

	if err != nil {
		k.logger.Error(err, "Error deleting user tools")
		return err
	}

	result, err := k.kdlUserToolsRes.
		Namespace(k.cfg.Kubernetes.Namespace).
		Patch(ctx, resName, types.MergePatchType, []byte("{\"metadata\":{\"finalizers\":[]}}"), metav1.PatchOptions{})

	if err != nil {
		return err
	}

	k.logger.Info("Applied path to remove finalizers", "result", result.Object)

	return k.waitUserToolsDeleted(ctx, resName)
}

func (k *Client) updateUserToolsTemplate(
	crd *map[string]interface{},
	resName string,
	data UserToolsData,
) (*map[string]interface{}, error) {
	crdToUpdate := *crd
	// update metadata.name and metadata.namespace in the CRD object
	metadata, ok := crdToUpdate["metadata"].(map[string]interface{})

	if !ok {
		return nil, errCRDNoMetadata
	}

	metadata["name"] = resName
	metadata["namespace"] = k.cfg.Kubernetes.Namespace

	// update spec.username and spec.usernameSlug in the CRD object
	spec, ok := crdToUpdate["spec"].(map[string]interface{})
	if !ok {
		return nil, errCRDNoSpec
	}

	spec["inputData"] = k.userToolsDataToMap(data)
	spec["username"] = data.Username
	spec["usernameSlug"] = data.SlugUsername

	// update spec.vscodeRuntime.image.repository and spec.vscodeRuntime.image.tag in the CRD object
	vscodeRuntime, ok := spec["vscodeRuntime"].(map[string]interface{})
	if !ok {
		return nil, errCRDNoSpecVscodeRuntime
	}

	vscodeRuntimeImage, ok := vscodeRuntime["image"].(map[string]interface{})
	if !ok {
		return nil, errCRDNoSpecVscodeRuntimeImage
	}

	vscodeRuntimeImage["repository"] = data.RuntimeImage
	vscodeRuntimeImage["tag"] = data.RuntimeTag

	env, ok := vscodeRuntime["env"].(map[string]interface{})
	if !ok {
		return nil, errCRDNoSpecVscodeRuntimeEnv
	}

	env["AWS_ACCESS_KEY_ID"] = data.MinioAccessKey.AccessKey
	env["AWS_SECRET_ACCESS_KEY"] = data.MinioAccessKey.SecretKey

	if data.Capabilities.ID != "" {
		if err := data.Capabilities.Validate(); err != nil {
			return nil, err
		}

		// update spec.nodeSelector in the CRD object
		if !data.Capabilities.IsNodeSelectorsEmpty() {
			spec["nodeSelector"] = data.Capabilities.GetNodeSelectors()
		}

		// update spec.tolerations in the CRD object
		if !data.Capabilities.IsTolerationsEmpty() {
			spec["tolerations"] = data.Capabilities.GetTolerations()
		}

		// update spec.affinity in the CRD object
		if !data.Capabilities.IsAffinitiesEmpty() {
			spec["affinity"] = data.Capabilities.GetAffinities()
		}
	}

	// update spec.podLabels.runtimeId and spec.podLabels.capabilityId in the CRD object
	podLabels, ok := spec["podLabels"].(map[string]interface{})
	if !ok {
		return nil, errCRDNoSpecPodLabels
	}

	if data.RuntimeID != "" {
		podLabels["runtimeId"] = data.RuntimeID
	}

	if data.Capabilities.ID != "" {
		podLabels["capabilityId"] = data.Capabilities.ID
	}

	return &crdToUpdate, nil
}

func (k *Client) GetConfigMapTemplateNameKDLUserTools() string {
	return k.cfg.ReleaseName + "-server-user-tools-template"
}

// CreateKDLUserToolsCR creates the user tools Custom Resource in Kubernetes.
func (k *Client) CreateKDLUserToolsCR(
	ctx context.Context,
	data UserToolsData,
) error {
	resName := fmt.Sprintf("usertools-%s", data.SlugUsername)

	configMap, err := k.GetConfigMap(ctx, k.GetConfigMapTemplateNameKDLUserTools())
	if err != nil {
		return err
	}

	// get the CRD template converted from yaml to go object from the ConfigMap
	crd, err := kdlutil.GetCrdTemplateFromConfigMap(configMap)
	if err != nil {
		return err
	}

	// update the CRD object with correct values
	crdUpdated, err := k.updateUserToolsTemplate(&crd, resName, data)
	if err != nil {
		return err
	}

	definition := &unstructured.Unstructured{
		Object: *crdUpdated,
	}

	_, err = k.kdlUserToolsRes.Namespace(k.cfg.Kubernetes.Namespace).Create(
		ctx,
		definition,
		metav1.CreateOptions{FieldValidation: "Strict"},
	)
	if err != nil {
		k.logger.Error(err, "Error creating user tools")
		return err
	}

	k.logger.Info("Created CRD KDLUserTools object", "resName", resName)

	return k.waitUserToolsRunning(ctx, resName)
}

// IsUserToolPODRunning checks if the there is a user tool POD running for the given username.
// NOTE: in this context, running means POD is started, but not that POD is ready to use.
func (k Client) IsUserToolPODRunning(ctx context.Context, username string) (bool, error) {
	_, err := k.getUserToolsPod(ctx, username)
	if err != nil {
		return false, err
	}

	return true, nil
}

// GetUserToolsPodStatus returns the status of the UserTools POD.
func (k Client) GetUserToolsPodStatus(ctx context.Context, username string) (entity.PodStatus, error) {
	pod, err := k.getUserToolsPod(ctx, username)
	if err != nil {
		return entity.PodStatusFailed, err
	}

	return entity.PodStatusFromK8sStatus(pod.Status), nil
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
		return v1.Pod{}, errNoPodFound
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

func (k *Client) ListKDLUserToolsCR(ctx context.Context) ([]unstructured.Unstructured, error) {
	kdlUserTools, err := k.kdlUserToolsRes.Namespace(k.cfg.Kubernetes.Namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, err
	}

	return kdlUserTools.Items, nil
}

func (k *Client) GetKDLUserToolsCR(ctx context.Context, resourceName string) (*unstructured.Unstructured, error) {
	object, err := k.kdlUserToolsRes.Namespace(k.cfg.Kubernetes.Namespace).Get(ctx, resourceName, metav1.GetOptions{})
	if err != nil {
		return nil, err
	}

	return object, nil
}

func (k *Client) UpdateKDLUserToolsCR(ctx context.Context, resourceName string, crd *map[string]interface{}) error {
	// CRD object is now updated and ready to be created
	k.logger.Info("Updating KDLUserTools CR", "resourceName", resourceName)

	// Get existing CR
	existingKDLUserTool, err := k.GetKDLUserToolsCR(ctx, resourceName)
	if err != nil {
		return err
	}

	// Recover the input data from the existing CR
	existingSpec, _, err := unstructured.NestedMap(existingKDLUserTool.Object, "spec")
	if err != nil {
		return errCRDCantDecodeInputData
	}

	inputDataMap, ok := existingSpec["inputData"].(map[string]interface{})
	if !ok {
		return errCRDCantDecodeInputData
	}

	inputData, err := k.mapToUserToolsData(inputDataMap)
	if err != nil {
		return errCRDCantDecodeInputData
	}

	// Re-apply the input data with the updated template
	crdUpdated, err := k.updateUserToolsTemplate(crd, resourceName, inputData)
	if err != nil {
		return err
	}

	// to update current CRD object, we need to get the existing CRD object and update the spec field
	specValue, ok := (*crdUpdated)["spec"]
	if !ok {
		return errCRDNoSpec
	}

	existingKDLUserTool.Object["spec"] = specValue

	_, err = k.kdlUserToolsRes.Namespace(k.cfg.Kubernetes.Namespace).Update(
		ctx,
		existingKDLUserTool,
		metav1.UpdateOptions{FieldValidation: "Strict"},
	)
	if err != nil {
		return err
	}

	k.logger.Info("Updated KDLUserTools CR", "resourceName", resourceName)

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
