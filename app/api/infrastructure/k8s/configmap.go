package k8s

import (
	"context"

	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func (k *Client) GetConfigMap(ctx context.Context, name string) (*v1.ConfigMap, error) {
	configmap, err := k.clientset.CoreV1().ConfigMaps(k.cfg.Kubernetes.Namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, err
	}

	return configmap, nil
}
