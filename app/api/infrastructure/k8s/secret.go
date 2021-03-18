package k8s

import (
	coreV1 "k8s.io/api/core/v1"
	k8sErrors "k8s.io/apimachinery/pkg/api/errors"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// CreateSecret creates a new k8s secret.
func (k *k8sClient) CreateSecret(name string, values map[string]string) error {
	k.logger.Infof("Creating secret \"%s\" in k8s...", name)

	secret := k.formSecret(name, values)

	createdSecret, err := k.clientset.CoreV1().Secrets(k.cfg.Kubernetes.Namespace).Create(secret)
	if err != nil {
		return err
	}

	k.logger.Infof("The secret \"%s\" was created in k8s correctly", createdSecret.Name)

	return nil
}

// CreateSecret updates a k8s secret.
func (k *k8sClient) UpdateSecret(name string, values map[string]string) error {
	k.logger.Infof("Updating secret \"%s\" in k8s...", name)

	secret := k.formSecret(name, values)

	_, err := k.clientset.CoreV1().Secrets(k.cfg.Kubernetes.Namespace).Update(secret)

	if err != nil {
		return err
	}

	k.logger.Infof("The secret \"%s\" was updated in k8s correctly", name)

	return nil
}

// IsSecretPresent checks if there is a secret with the given name.
func (k *k8sClient) IsSecretPresent(name string) (bool, error) {
	_, err := k.clientset.CoreV1().Secrets(k.cfg.Kubernetes.Namespace).Get(name, metaV1.GetOptions{})
	if err != nil && !k8sErrors.IsNotFound(err) {
		return false, err
	}

	return !k8sErrors.IsNotFound(err), nil
}

// formSecret conform a new k8s secret from values map.
func (k *k8sClient) formSecret(name string, values map[string]string) *coreV1.Secret {
	secretData := map[string][]byte{}
	for key, val := range values {
		secretData[key] = []byte(val)
	}

	return &coreV1.Secret{
		TypeMeta: metaV1.TypeMeta{},
		ObjectMeta: metaV1.ObjectMeta{
			Name: name,
		},
		Data: secretData,
	}
}
