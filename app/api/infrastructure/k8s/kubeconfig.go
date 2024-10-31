package k8s

import (
	"context"
	"encoding/base64"
	"errors"

	v1 "k8s.io/api/core/v1"
)

var (
	ErrNoSecretInServiceAccount      = errors.New("no secrets found in the serviceAccount")
	ErrReadingSecretInServiceAccount = errors.New("error reading secret in in the serviceAccount")
)

func (k *k8sClient) extractServiceAccountSecretInfo(ctx context.Context, serviceAccount *v1.ServiceAccount) (ca, token []byte, err error) {
	secrets := serviceAccount.Secrets

	if len(secrets) == 0 {
		return nil, nil, ErrNoSecretInServiceAccount
	}

	secretName := secrets[0].Name

	secret, err := k.GetSecret(ctx, secretName)
	if err != nil {
		k.logger.Error(err, "error retrieving secret", "secretName", secretName)
		return nil, nil, ErrReadingSecretInServiceAccount
	}

	ca = secret[v1.ServiceAccountRootCAKey]
	token = secret[v1.ServiceAccountTokenKey]

	return ca, token, nil
}

// generateKubeconfig generate a kubeconfig file in a string.
func (k *k8sClient) generateKubeconfig(ctx context.Context, serviceAccount *v1.ServiceAccount) ([]byte, error) {
	ca, token, err := k.extractServiceAccountSecretInfo(ctx, serviceAccount)
	if err != nil {
		return nil, err
	}

	kubeconfig := []byte(`
apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: ` + base64.StdEncoding.EncodeToString(ca) + `
    server: ` + k.cfg.UserToolsKubeconfig.ExternalServerURL + `
  name: konstellation
contexts:
- context:
    cluster: konstellation
    user: coder
    namespace: ` + k.cfg.Kubernetes.Namespace + `
  name: default
current-context: default
kind: Config
preferences: {}
users:
- name: coder
  user:
    token: ` + string(token) + `
`)

	return kubeconfig, nil
}

// GetUserKubeconfig get a user kubeconfig string in k8s.
func (k *k8sClient) GetUserKubeconfig(ctx context.Context, usernameSlug string) ([]byte, error) {
	serviceAccount, err := k.GetUserServiceAccount(ctx, usernameSlug)
	if err != nil {
		return nil, err
	}

	kubeconfig, err := k.generateKubeconfig(ctx, serviceAccount)
	if err != nil {
		return nil, err
	}

	return kubeconfig, nil
}
