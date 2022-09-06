package k8s

import (
	"context"
	"fmt"

	"github.com/konstellation-io/kdl-server/app/api/pkg/kdlutil"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
)

func (k *k8sClient) CreateKDLProjectCR(ctx context.Context, projectID string) error {
	const oAuth2ProxyCookieSecretLen = 16

	cookieSecret, err := kdlutil.GenerateRandomString(oAuth2ProxyCookieSecretLen)
	if err != nil {
		return err
	}

	resName := fmt.Sprintf("kdlproject-%s", projectID)

	tlsConfig := map[string]interface{}{
		"enabled": k.cfg.TLS.Enabled,
	}

	if k.cfg.ProjectMLFlow.Ingress.TLS.SecretName != nil {
		tlsConfig["secretName"] = &k.cfg.ProjectMLFlow.Ingress.TLS.SecretName
	}

	ingressAnnotations, err := k.getIngressAnnotations(k.cfg.ProjectMLFlow.Ingress.Annotations)
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
					"accessKey": k.cfg.Minio.AccessKey,
					"secretKey": k.cfg.Minio.SecretKey,
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
					"cookieSecret": cookieSecret,
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
						"annotations": ingressAnnotations,
					},
				},
				"filebrowser": map[string]interface{}{
					"image": map[string]string{
						"repository": k.cfg.ProjectFilebrowser.Image.Repository,
						"tag":        k.cfg.ProjectFilebrowser.Image.Tag,
						"pullPolicy": k.cfg.ProjectFilebrowser.Image.PullPolicy,
					},
				},
			},
		},
	}

	k.logger.Infof("Creating kdl project: %#v", definition.Object)
	_, err = k.kdlprojectRes.Namespace(k.cfg.Kubernetes.Namespace).Create(ctx, definition, metav1.CreateOptions{})

	if err == nil {
		k.logger.Infof("The kdl project \"%s\" was created correctly in k8s", resName)
	}

	return err
}
