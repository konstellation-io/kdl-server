package k8s

import (
	"context"

	coreV1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// GetPVC returns the PVC data.
func (k *Client) GetPVC(ctx context.Context, name string) (*coreV1.PersistentVolumeClaim, error) {
	k.logger.Info("Getting pvc", "name", name)

	pvc, err := k.clientset.CoreV1().PersistentVolumeClaims(k.cfg.Kubernetes.Namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, err
	}

	return pvc, nil
}
