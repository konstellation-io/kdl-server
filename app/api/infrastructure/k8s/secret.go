package k8s

import (
	"context"

	coreV1 "k8s.io/api/core/v1"
	k8sErrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// CreateSecret creates a new k8s secret.
func (k *K8sClient) CreateSecret(ctx context.Context, name string, values map[string]string) error {
	k.logger.Info("Creating secret in k8s...", "secretName", name)

	secret := k.newSecret(name, values)

	createdSecret, err := k.clientset.CoreV1().Secrets(k.cfg.Kubernetes.Namespace).Create(ctx, secret, metav1.CreateOptions{})
	if err != nil {
		return err
	}

	k.logger.Info("Secret created correctly in k8s", "secretName", createdSecret.Name)

	return nil
}

// UpdateSecret updates a k8s secret.
func (k *K8sClient) UpdateSecret(ctx context.Context, name string, values map[string]string) error {
	k.logger.Info("Updating secret in k8s...", "secretName", name)

	secret := k.newSecret(name, values)

	_, err := k.clientset.CoreV1().Secrets(k.cfg.Kubernetes.Namespace).Update(ctx, secret, metav1.UpdateOptions{})
	if err != nil {
		return err
	}

	k.logger.Info("Secret updated correctly in k8s", "secretName", name)

	return nil
}

// GetSecret returns the secret data.
func (k *K8sClient) GetSecret(ctx context.Context, name string) (map[string][]byte, error) {
	s, err := k.clientset.CoreV1().Secrets(k.cfg.Kubernetes.Namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil {
		return nil, err
	}

	return s.Data, nil
}

// isSecretPresent checks if there is a secret with the given name.
func (k *K8sClient) isSecretPresent(ctx context.Context, name string) (bool, error) {
	_, err := k.clientset.CoreV1().Secrets(k.cfg.Kubernetes.Namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil && !k8sErrors.IsNotFound(err) {
		return false, err
	}

	return !k8sErrors.IsNotFound(err), nil
}

// newSecret conform a new k8s secret from values map.
func (k *K8sClient) newSecret(name string, values map[string]string) *coreV1.Secret {
	secretData := map[string][]byte{}
	for key, val := range values {
		secretData[key] = []byte(val)
	}

	return &coreV1.Secret{
		TypeMeta: metav1.TypeMeta{},
		ObjectMeta: metav1.ObjectMeta{
			Name: name,
		},
		Data: secretData,
	}
}
