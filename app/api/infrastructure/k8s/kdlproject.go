package k8s

import (
	"context"
	"fmt"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"math/rand"
)

var letters = []rune("abcdefghijklmnopqrstuvwxyz0123456789")

// TODO move to kdlutil
func randSeq(n int) string {
	b := make([]rune, n)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}

func (k *k8sClient) CreateKDLProjectCR(ctx context.Context, projectID string) error {
	resName := fmt.Sprintf("kdlproject-%s", projectID)

	definition := &unstructured.Unstructured{
		Object: map[string]interface{}{
			"apiVersion": kdlprojectAPIVersion,
			"kind":       "KDLProject",
			"metadata": map[string]interface{}{
				"name":      resName,
				"namespace": k.cfg.Kubernetes.Namespace, // TODO review
				"labels": map[string]interface{}{
					"app": resName,
				},
			},
			"spec": map[string]interface{}{
				"projectId": projectID,
				"domain":    k.cfg.BaseDomainName,
				"tls": map[string]interface{}{
					"enabled": k.cfg.TLS,
				},
				"ingress": map[string]string{
					"type": k.cfg.VSCode.Ingress.Type,
				},
				"minio": map[string]string{
					"accessKey": k.cfg.Minio.AccessKey,
					"secretKey": k.cfg.Minio.SecretKey,
				},
				// TODO
				//"argocd": map[string]string{
				//	"enabled": k.cfg.Ar,
				//},
				//"giteaOauth2Setup": map[string]interface{}{
				//	"image": map[string]string{
				//		"repository": "terminus7/gitea-oauth2-setup",
				//		"tag":        "latest",
				//		"pullPolicy": "IfNotPresent",
				//	},
				//},
				"oauth2Proxy": map[string]interface{}{
					// TODO
					//"image": map[string]string{
					//	"repository": "quay.io/oauth2-proxy/oauth2-proxy",
					//	"tag":        "v7.0.1-amd64",
					//	"pullPolicy": "IfNotPresent",
					//},
					"cookieSecret": randSeq(16),
				},
				"mlflow": map[string]interface{}{
					"image": map[string]string{
						// TODO change docker img
						"repository": "terminus7/mlflow",
						"tag":        "latest",
						"pullPolicy": "IfNotPresent",
					},
					"s3": map[string]string{
						"bucket": fmt.Sprintf("%s/mlflow-artifacts", projectID),
					},
				},
			},
		},
	}

	k.logger.Infof("Creating kdl project: %#v", definition.Object)
	_, err := k.kdlprojectRes.Namespace(k.cfg.Kubernetes.Namespace).Create(ctx, definition, metav1.CreateOptions{})

	if err == nil {
		k.logger.Infof("The kdl project \"%s\" was created correctly in k8s", resName)
	}

	return err
}
