package k8s

import (
	"context"
	"fmt"

	"github.com/konstellation-io/kdl-server/app/api/pkg/kdlutil"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
)

type projectK8sResouces struct {
	cookieSecret             string
	mlflowIngressAnnotations map[string]interface{}
	mlflowNodeSelector       map[string]interface{}
	mlflowAffinity           map[string]interface{}
	mlflowTolerations        []map[string]string
	filebrowserNodeSelector  map[string]interface{}
	filebrowserAffinity      map[string]interface{}
	filebrowserTolerations   []map[string]string
}

func (k *Client) getProjectName(projectID string) string {
	return fmt.Sprintf("kdlproject-%s", projectID)
}

func (k *Client) getProjectK8sResouces() (projectK8sResouces, error) {
	const oAuth2ProxyCookieSecretLen = 16

	cookieSecret, err := kdlutil.GenerateRandomString(oAuth2ProxyCookieSecretLen)
	if err != nil {
		return projectK8sResouces{}, err
	}

	mlflowIngressAnnotations, err := k.getK8sMap(k.cfg.ProjectMLFlow.Ingress.Annotations)
	if err != nil {
		return projectK8sResouces{}, fmt.Errorf("error getting mlflow ingress annotations: %w", err)
	}

	mlflowNodeSelector, err := k.getK8sMap(k.cfg.ProjectMLFlow.NodeSelector)
	if err != nil {
		return projectK8sResouces{}, fmt.Errorf("error getting mlflow nodeSelector: %w", err)
	}

	mlflowAffinity, err := k.getK8sMap(k.cfg.ProjectMLFlow.Affinity)
	if err != nil {
		return projectK8sResouces{}, fmt.Errorf("error getting mlflow affinity: %w", err)
	}

	mlflowTolerations, err := k.getK8sList(k.cfg.ProjectMLFlow.Tolerations)
	if err != nil {
		return projectK8sResouces{}, fmt.Errorf("error getting mlflow tolerations: %w", err)
	}

	filebrowserNodeSelector, err := k.getK8sMap(k.cfg.ProjectFilebrowser.NodeSelector)
	if err != nil {
		return projectK8sResouces{}, fmt.Errorf("error getting filebrowser nodeSelector: %w", err)
	}

	filebrowserAffinity, err := k.getK8sMap(k.cfg.ProjectFilebrowser.Affinity)
	if err != nil {
		return projectK8sResouces{}, fmt.Errorf("error getting filebrowser affinity: %w", err)
	}

	filebrowserTolerations, err := k.getK8sList(k.cfg.ProjectFilebrowser.Tolerations)
	if err != nil {
		return projectK8sResouces{}, fmt.Errorf("error getting filebrowser tolerations: %w", err)
	}

	return projectK8sResouces{
		cookieSecret:             cookieSecret,
		mlflowIngressAnnotations: mlflowIngressAnnotations,
		mlflowNodeSelector:       mlflowNodeSelector,
		mlflowAffinity:           mlflowAffinity,
		mlflowTolerations:        mlflowTolerations,
		filebrowserNodeSelector:  filebrowserNodeSelector,
		filebrowserAffinity:      filebrowserAffinity,
		filebrowserTolerations:   filebrowserTolerations,
	}, nil
}

func (k *Client) CreateKDLProjectCR(ctx context.Context, projectID string) error {
	resName := k.getProjectName(projectID)

	tlsConfig := map[string]interface{}{
		"enabled": k.cfg.TLS.Enabled,
	}
	if k.cfg.ProjectMLFlow.Ingress.TLS.SecretName != nil {
		tlsConfig["secretName"] = &k.cfg.ProjectMLFlow.Ingress.TLS.SecretName
	}

	k8sResouces, err := k.getProjectK8sResouces()
	if err != nil {
		return err
	}

	definition := &unstructured.Unstructured{
		Object: map[string]interface{}{
			"apiVersion": kdlprojectAPIVersion,
			"kind":       "KDLProject",
			"metadata": map[string]interface{}{
				"name":      resName,
				"namespace": k.cfg.Kubernetes.Namespace,
				"labels": map[string]interface{}{
					"app": resName,
				},
			},
			"spec": map[string]interface{}{
				"projectId": projectID,
				"domain":    k.cfg.BaseDomainName,
				"sharedVolume": map[string]interface{}{
					"name": k.cfg.SharedVolume.Name,
				},
				"minio": map[string]string{
					"accessKey":   k.cfg.Minio.AccessKey,
					"secretKey":   k.cfg.Minio.SecretKey,
					"endpointURL": fmt.Sprintf("http://%s", k.cfg.Minio.Endpoint),
				},
				"giteaOauth2Setup": map[string]interface{}{
					"image": map[string]string{
						"repository": k.cfg.GiteaOAuth2Setup.Image.Repository,
						"tag":        k.cfg.GiteaOAuth2Setup.Image.Tag,
						"pullPolicy": k.cfg.GiteaOAuth2Setup.Image.PullPolicy,
					},
				},
				"oauth2Proxy": map[string]interface{}{
					"image": map[string]string{
						"repository": k.cfg.OAuth2Proxy.Image.Repository,
						"tag":        k.cfg.OAuth2Proxy.Image.Tag,
						"pullPolicy": k.cfg.OAuth2Proxy.Image.PullPolicy,
					},
					"cookieSecret": k8sResouces.cookieSecret,
				},
				"mlflow": map[string]interface{}{
					"image": map[string]string{
						"repository": k.cfg.ProjectMLFlow.Image.Repository,
						"tag":        k.cfg.ProjectMLFlow.Image.Tag,
						"pullPolicy": k.cfg.ProjectMLFlow.Image.PullPolicy,
					},
					"volume": map[string]interface{}{
						"storageClassName": k.cfg.ProjectMLFlow.Volume.StorageClassName,
						"size":             k.cfg.ProjectMLFlow.Volume.Size,
					},
					"s3": map[string]string{
						"bucket": fmt.Sprintf("%s/mlflow-artifacts", projectID),
					},
					"ingress": map[string]interface{}{
						"tls":         tlsConfig,
						"className":   k.cfg.ProjectMLFlow.Ingress.ClassName,
						"annotations": k8sResouces.mlflowIngressAnnotations,
					},
					"nodeSelector": k8sResouces.mlflowNodeSelector,
					"affinity":     k8sResouces.mlflowAffinity,
					"tolerations":  k8sResouces.mlflowTolerations,
				},
				"filebrowser": map[string]interface{}{
					"image": map[string]string{
						"repository": k.cfg.ProjectFilebrowser.Image.Repository,
						"tag":        k.cfg.ProjectFilebrowser.Image.Tag,
						"pullPolicy": k.cfg.ProjectFilebrowser.Image.PullPolicy,
					},
					"nodeSelector": k8sResouces.filebrowserNodeSelector,
					"affinity":     k8sResouces.filebrowserAffinity,
					"tolerations":  k8sResouces.filebrowserTolerations,
				},
			},
		},
	}

	k.logger.Info("Creating kdl project")

	_, err = k.kdlprojectRes.Namespace(k.cfg.Kubernetes.Namespace).Create(ctx, definition, metav1.CreateOptions{})
	if err == nil {
		k.logger.Info("KDL project created correctly in k8s", "projectName", resName)
	}

	return err
}

func (k *Client) DeleteKDLProjectCR(ctx context.Context, projectID string) error {
	resName := k.getProjectName(projectID)

	k.logger.Info("Attempting to delete KDL Project CR in k8s", "projectName", resName)

	err := k.kdlprojectRes.Namespace(k.cfg.Kubernetes.Namespace).Delete(ctx, resName, *metav1.NewDeleteOptions(0))
	if err == nil {
		k.logger.Info("KDL Project CR correctly deleted in k8s", "projectName", resName)
	}

	return err
}
