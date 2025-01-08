package k8s

import (
	"context"

	"github.com/konstellation-io/kdl-server/app/api/pkg/kdlutil"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
)

func (k *Client) GetConfigMapTemplateNameKDLProject() string {
	return k.cfg.ReleaseName + "-server-project-template"
}

func (k *Client) updateKDLProjectTemplate(projectID string, crd *map[string]interface{}) (*map[string]interface{}, error) {
	crdToUpdate := *crd

	// update the spec.projectId in the CRD object
	spec, ok := crdToUpdate["spec"].(map[string]interface{})
	if !ok {
		return nil, errCRDNoSpec
	}

	spec["projectId"] = projectID

	// update spec.mlflow.env.ARTIFACTS_BUCKET in the CRD object
	mlflow, ok := spec["mlflow"].(map[string]interface{})

	if !ok {
		return nil, errCRDNoSpecMlflow
	}

	mlflowEnv, ok := mlflow["env"].(map[string]interface{})
	if !ok {
		return nil, errCRDNoSpecMlflowEnv
	}

	mlflowEnv["ARTIFACTS_BUCKET"] = projectID
	// FUTURE: update AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY with minIO values for the project

	// update metadata.name and metadata.namespace in the CRD object
	metadata, ok := crdToUpdate["metadata"].(map[string]interface{})

	if !ok {
		return nil, errCRDNoMetadata
	}

	metadata["name"] = projectID
	metadata["namespace"] = k.cfg.Kubernetes.Namespace

	return &crdToUpdate, nil
}

func (k *Client) CreateKDLProjectCR(ctx context.Context, projectID string) error {
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
	crdUpdated, err := k.updateKDLProjectTemplate(projectID, &crd)
	if err != nil {
		return err
	}

	// CRD object is now updated and ready to be created
	k.logger.Info("Creating kdl project")

	definition := &unstructured.Unstructured{
		Object: *crdUpdated,
	}

	_, err = k.kdlProjectRes.Namespace(k.cfg.Kubernetes.Namespace).Create(ctx, definition, metav1.CreateOptions{})
	if err != nil {
		return err
	}

	k.logger.Info("KDL project created correctly in k8s", "projectName", projectID)

	return nil
}

func (k *Client) DeleteKDLProjectCR(ctx context.Context, projectID string) error {
	k.logger.Info("Attempting to delete KDL Project CR in k8s", "projectName", projectID)

	err := k.kdlProjectRes.Namespace(k.cfg.Kubernetes.Namespace).Delete(ctx, projectID, *metav1.NewDeleteOptions(0))
	if err == nil {
		k.logger.Info("KDL Project CR correctly deleted in k8s", "projectName", projectID)
	}

	return err
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

func (k *Client) UpdateKDLProjectsCR(ctx context.Context, projectID string, crd *map[string]interface{}) error {
	// update the CRD object with correct values
	crdUpdated, err := k.updateKDLProjectTemplate(projectID, crd)
	if err != nil {
		return err
	}

	// to update current CRD object, we need to get the existing CRD object and update the spec field
	specValue, ok := (*crdUpdated)["spec"]
	if !ok {
		return errCRDNoSpec
	}

	existingKDLProject, err := k.GetKDLProjectCR(ctx, projectID)
	if err != nil {
		return err
	}

	existingKDLProject.Object["spec"] = specValue

	// CRD object is now updated and ready to be created
	k.logger.Info("Updating kdl project", "projectName", projectID)

	_, err = k.kdlProjectRes.Namespace(k.cfg.Kubernetes.Namespace).Update(ctx, existingKDLProject, metav1.UpdateOptions{})
	if err != nil {
		k.logger.Error(err, "Error updating KDL Project CR in k8s", "projectName", projectID)
		return err
	}

	k.logger.Info("Updated kdl project", "projectName", projectID)

	return nil
}
