package k8s

import (
	"context"
	"fmt"
)

const (
	kubeconfigSecretKey = "kubeconfig"
)

// getUserKubeconfigSecretName returns the name of the kubeconfig secret for a given user.
func (k k8sClient) getUserKubeconfigSecretName(usernameSlug string) string {
	return fmt.Sprintf("%s-kubeconfig", usernameSlug)
}

// GetUserKubeconfigSecret returns kubeconfig for the given user.
func (k *k8sClient) GetUserKubeconfigSecret(ctx context.Context, usernameSlug string) (string, error) {
	kubeconfigSecret, err := k.GetSecret(ctx, k.getUserKubeconfigSecretName(usernameSlug))
	if err != nil {
		return "", err
	}

	return string(kubeconfigSecret[kubeconfigSecretKey]), nil
}
