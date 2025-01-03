package k8s

import (
	"context"

	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/watch"
)

func (k *Client) GetConfigMap(ctx context.Context, name string) (*v1.ConfigMap, error) {
	configmap, err := k.clientset.CoreV1().ConfigMaps(k.cfg.Kubernetes.Namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, err
	}

	return configmap, nil
}

func (k *Client) getLabelSelector() string {
	return "kdl-server/component=server"
}

func (k *Client) CreateConfigMapWatcher(ctx context.Context) (watch.Interface, error) {
	k.logger.Info("Creating watcher for Configmap templates for project and user tools", "label", k.getLabelSelector())

	opts := metav1.ListOptions{
		TypeMeta:      metav1.TypeMeta{},
		LabelSelector: k.getLabelSelector(),
		FieldSelector: "",
	}

	watcher, err := k.clientset.CoreV1().ConfigMaps(k.cfg.Kubernetes.Namespace).Watch(ctx, opts)
	if err != nil {
		return nil, err
	}

	return watcher, nil
}
