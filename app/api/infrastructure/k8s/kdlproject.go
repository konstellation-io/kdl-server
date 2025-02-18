package k8s

import (
	"context"
	"encoding/json"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/pkg/kdlutil"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
)

type ProjectData struct {
	ProjectID      string                `json:"projectId"`
	MinioAccessKey entity.MinioAccessKey `json:"minioAccessKey"`
	Archived       bool                  `json:"archived"`
}

func (k *Client) projectDataToMap(data ProjectData) map[string]interface{} {
	return map[string]interface{}{
		"projectId":      data.ProjectID,
		"minioAccessKey": data.MinioAccessKey,
		"archived":       data.Archived,
	}
}

func (k *Client) mapToProjectData(data map[string]interface{}) (ProjectData, error) {
	jsonData, err := json.Marshal(data)
	if err != nil {
		k.logger.Info("inputData cannot be marshal to json")
		return ProjectData{}, errCRDCantDecodeInputData
	}

	var project ProjectData
	err = json.Unmarshal(jsonData, &project)

	if err != nil {
		k.logger.Info("inputData cannot be converted to unmarshal to ProjectData")
		return ProjectData{}, errCRDCantDecodeInputData
	}

	return project, nil
}

func (k *Client) GetConfigMapTemplateNameKDLProject() string {
	return k.cfg.ReleaseName + "-server-project-template"
}

func (k *Client) updateKDLProjectTemplate(data ProjectData, crd *map[string]interface{}) (*map[string]interface{}, error) {
	crdToUpdate := *crd

	// update the spec.projectId in the CRD object
	spec, ok := crdToUpdate["spec"].(map[string]interface{})
	if !ok {
		return nil, errCRDNoSpec
	}

	spec["inputData"] = k.projectDataToMap(data)
	spec["projectId"] = data.ProjectID

	// update spec.mlflow in the CRD object
	mlflow, ok := spec["mlflow"].(map[string]interface{})

	if !ok {
		return nil, errCRDNoSpecMlflow
	}

	mlflow["enabled"] = !data.Archived

	// update spec.mlflow.env in the CRD object
	mlflowEnv, ok := mlflow["env"].(map[string]interface{})
	if !ok {
		return nil, errCRDNoSpecMlflowEnv
	}

	mlflowEnv["ARTIFACTS_BUCKET"] = data.ProjectID
	mlflowEnv["AWS_ACCESS_KEY_ID"] = data.MinioAccessKey.AccessKey
	mlflowEnv["AWS_SECRET_ACCESS_KEY"] = data.MinioAccessKey.SecretKey

	// update metadata.name and metadata.namespace in the CRD object
	metadata, ok := crdToUpdate["metadata"].(map[string]interface{})

	if !ok {
		return nil, errCRDNoMetadata
	}

	metadata["name"] = data.ProjectID
	metadata["namespace"] = k.cfg.Kubernetes.Namespace

	// update spec.filebrowser in the CRD object
	filebrowser, ok := spec["filebrowser"].(map[string]interface{})

	if !ok {
		return nil, errCRDNoSpecFilebrowser
	}

	filebrowser["enabled"] = !data.Archived

	// update spec.filebrowser.env in the CRD object
	filebrowserEnv, ok := filebrowser["env"].(map[string]interface{})

	if !ok {
		return nil, errCRDNoSpecFilebrowserEnv
	}

	filebrowserEnv["AWS_S3_ACCESS_KEY_ID"] = data.MinioAccessKey.AccessKey
	filebrowserEnv["AWS_S3_SECRET_ACCESS_KEY"] = data.MinioAccessKey.SecretKey

	return &crdToUpdate, nil
}

func (k *Client) CreateKDLProjectCR(ctx context.Context, data ProjectData) error {
	// get the CRD template from the ConfigMap
	configMap, err := k.GetConfigMap(ctx, k.GetConfigMapTemplateNameKDLProject())

	if err != nil {
		return err
	}

	// get the CRD template converted from yaml to go object from the ConfigMap
	crd, err := kdlutil.GetCrdTemplateFromConfigMap(configMap)
	if err != nil {
		return err
	}

	// update the CRD object with correct values
	crdUpdated, err := k.updateKDLProjectTemplate(data, &crd)
	if err != nil {
		return err
	}

	// CRD object is now updated and ready to be created
	k.logger.Info("Creating KDLProject")

	definition := &unstructured.Unstructured{
		Object: *crdUpdated,
	}

	_, err = k.kdlProjectRes.Namespace(k.cfg.Kubernetes.Namespace).Create(ctx, definition, metav1.CreateOptions{})
	if err != nil {
		return err
	}

	k.logger.Info("KDLProject created correctly", "projectName", data.ProjectID)

	return nil
}

func (k *Client) DeleteKDLProjectCR(ctx context.Context, projectID string) error {
	k.logger.Info("Attempting to delete KDLProject CR", "projectName", projectID)

	err := k.kdlProjectRes.Namespace(k.cfg.Kubernetes.Namespace).Delete(ctx, projectID, *metav1.NewDeleteOptions(0))
	if err != nil {
		return err
	}

	k.logger.Info("KDLProject CR correctly deleted", "projectName", projectID)

	return nil
}

func (k *Client) ListKDLProjectsNameCR(ctx context.Context) ([]string, error) {
	kdlProjects, err := k.kdlProjectRes.Namespace(k.cfg.Kubernetes.Namespace).List(ctx, metav1.ListOptions{})
	if err != nil {
		return nil, err
	}

	projectIDs := make([]string, len(kdlProjects.Items))
	for i, project := range kdlProjects.Items {
		projectIDs[i] = project.GetName()
	}

	return projectIDs, nil
}

func (k *Client) GetKDLProjectCR(ctx context.Context, name string) (*unstructured.Unstructured, error) {
	object, err := k.kdlProjectRes.Namespace(k.cfg.Kubernetes.Namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, err
	}

	return object, nil
}

func (k *Client) getCRDInputData(existingKDLProject *unstructured.Unstructured) (ProjectData, error) {
	// Recover the input data from the existing CR
	existingSpec, _, err := unstructured.NestedMap(existingKDLProject.Object, "spec")
	if err != nil {
		return ProjectData{}, errCRDCantDecodeInputData
	}

	inputDataMap, ok := existingSpec["inputData"].(map[string]interface{})
	if !ok {
		return ProjectData{}, errCRDCantDecodeInputData
	}

	inputData, err := k.mapToProjectData(inputDataMap)
	if err != nil {
		return ProjectData{}, errCRDCantDecodeInputData
	}

	return inputData, nil
}

func (k *Client) updateKDLProject(
	ctx context.Context, projectID string, existingKDLProject *unstructured.Unstructured, crdUpdated *map[string]interface{},
) error {
	// to update current CRD object, we need to get the existing CRD object and update the spec field
	specValue, ok := (*crdUpdated)["spec"]
	if !ok {
		return errCRDNoSpec
	}

	existingKDLProject.Object["spec"] = specValue

	// CRD object is now updated and ready to be created
	_, err := k.kdlProjectRes.Namespace(k.cfg.Kubernetes.Namespace).Update(ctx, existingKDLProject, metav1.UpdateOptions{})
	if err != nil {
		k.logger.Error(err, "Error updating KDLProject CR", "projectName", projectID)
		return err
	}

	k.logger.Info("Updated KDLProject", "projectName", projectID)

	return nil
}

func (k *Client) UpdateKDLProjectsCR(ctx context.Context, projectID string, crd *map[string]interface{}) error {
	k.logger.Info("Updating KDLProject", "projectName", projectID)

	// Get the existing CRD object
	existingKDLProject, err := k.GetKDLProjectCR(ctx, projectID)
	if err != nil {
		return err
	}

	// Get input data from the existing CR
	inputData, err := k.getCRDInputData(existingKDLProject)
	if err != nil {
		return err
	}

	// Re-apply the input data with the updated template
	crdUpdated, err := k.updateKDLProjectTemplate(inputData, crd)
	if err != nil {
		return err
	}
	// update the CRD object with correct values
	err = k.updateKDLProject(ctx, projectID, existingKDLProject, crdUpdated)
	if err != nil {
		return err
	}

	return nil
}

func (k *Client) ToggleArchiveKDLProjectCR(ctx context.Context, projectID string, archived bool) error {
	k.logger.Info("Toggle archive field for KDLProject CRD", "projectName", projectID, "archived", archived)

	// Get the existing CRD object
	existingKDLProject, err := k.GetKDLProjectCR(ctx, projectID)
	if err != nil {
		return err
	}

	// Get input data from the existing CR
	inputData, err := k.getCRDInputData(existingKDLProject)
	if err != nil {
		return err
	}

	// Update the archived field to new value
	inputData.Archived = archived

	// Re-apply the input data with the updated template
	crdUpdated, err := k.updateKDLProjectTemplate(inputData, &existingKDLProject.Object)
	if err != nil {
		return err
	}

	// update the CRD object with correct values
	err = k.updateKDLProject(ctx, projectID, existingKDLProject, crdUpdated)
	if err != nil {
		return err
	}

	return nil
}
