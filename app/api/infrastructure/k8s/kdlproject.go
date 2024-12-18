package k8s

import (
	"context"
	"errors"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
)

var errCRDNoSpec = errors.New("CRD does not have a 'spec' field")
var errCRDNoSpecMlflow = errors.New("CRD does not have a 'spec.mlflow' field")
var errCRDNoSpecMlflowEnv = errors.New("CRD does not have a 'spec.mlflow.env' field")
var errCRDNoMetadata = errors.New("CRD does not have a 'metadata' field")

func (k *Client) CreateKDLProjectCR(ctx context.Context, projectID string) error {
	// get the CRD template from the ConfigMap
	configMapKdlProjectName := k.cfg.ReleaseName + "-server-project-template"
	configMap, err := k.GetConfigMap(ctx, configMapKdlProjectName)

	if err != nil {
		return err
	}

	// get the CRD template converted from yaml to go object from the ConfigMap
	crd, err := k.getCrdTemplateFromConfigMap(configMap)
	if err != nil {
		return err
	}

	// update the CRD object with correct values
	// update the spec.projectId in the CRD object
	spec, ok := crd["spec"].(map[string]interface{})
	if !ok {
		return errCRDNoSpec
	}

	spec["projectId"] = projectID

	// update spec.mlflow.env.ARTIFACTS_BUCKET in the CRD object
	mlflow, ok := spec["mlflow"].(map[string]interface{})

	if !ok {
		return errCRDNoSpecMlflow
	}

	mlflowEnv, ok := mlflow["env"].(map[string]interface{})
	if !ok {
		return errCRDNoSpecMlflowEnv
	}

	mlflowEnv["ARTIFACTS_BUCKET"] = projectID
	// FUTURE: update MINIO_ACCESS_KEY and MINIO_SECRET_KEY with minIO values for the project

	// update metadata.name and metadata.namespace in the CRD object
	metadata, ok := crd["metadata"].(map[string]interface{})

	if !ok {
		return errCRDNoMetadata
	}

	metadata["name"] = projectID
	metadata["namespace"] = k.cfg.Kubernetes.Namespace

	// CRD object is now updated and ready to be created
	k.logger.Info("Creating kdl project")

	_, err = k.kdlprojectRes.Namespace(k.cfg.Kubernetes.Namespace).Create(
		ctx,
		&unstructured.Unstructured{
			Object: crd,
		},
		metav1.CreateOptions{},
	)
	if err != nil {
		return err
	}

	k.logger.Info("KDL project created correctly in k8s", "projectName", projectID)

	return nil
}

func (k *Client) DeleteKDLProjectCR(ctx context.Context, projectID string) error {
	k.logger.Info("Attempting to delete KDL Project CR in k8s", "projectName", projectID)

	err := k.kdlprojectRes.Namespace(k.cfg.Kubernetes.Namespace).Delete(ctx, projectID, *metav1.NewDeleteOptions(0))
	if err == nil {
		k.logger.Info("KDL Project CR correctly deleted in k8s", "projectName", projectID)
	}

	return err
}
