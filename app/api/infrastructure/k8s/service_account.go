package k8s

import (
	"context"
	"fmt"

	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// newServiceAccount conform a new k8s serviceAccount.
func (k *k8sClient) newServiceAccount(usernameSlug, secretName string) *v1.ServiceAccount {
	automountServiceAccountToken := true

	return &v1.ServiceAccount{
		ObjectMeta: metav1.ObjectMeta{
			Name: k.getUserServiceAccountName(usernameSlug),
			Labels: map[string]string{
				"konstellation.io/username":      usernameSlug,
				"konstellation.io/deployed-by":   "kdlapp",
				"konstellation.io/app-release":   k.cfg.Labels.Common.AppRelease,
				"konstellation.io/chart-release": k.cfg.Labels.Common.ChartRelease,
			},
		},
		AutomountServiceAccountToken: &automountServiceAccountToken,
		Secrets: []v1.ObjectReference{
			{
				Name: secretName,
			},
		},
	}
}

// getUserServiceAccountName returns the name of the service account for a given user.
func (k k8sClient) getUserServiceAccountName(usernameSlug string) string {
	return fmt.Sprintf("%s-service-account", usernameSlug)
}

// getServiceAccountSecretName returns the name of the service account secret for a given user.
func (k k8sClient) getServiceAccountSecretName(usernameSlug string) string {
	return fmt.Sprintf("%s-service-account-secret", usernameSlug)
}

// CreateUserServiceAccount creates a new k8s serviceAccount for a user.
func (k *k8sClient) CreateUserServiceAccount(ctx context.Context, usernameSlug string) (*v1.ServiceAccount, error) {
	saSecretName := k.getServiceAccountSecretName(usernameSlug)

	k.logger.Info("Creating service account for user in k8s...", "username", usernameSlug)

	sa := k.newServiceAccount(usernameSlug, saSecretName)
	serviceAccount, err := k.clientset.CoreV1().ServiceAccounts(k.cfg.Kubernetes.Namespace).Create(ctx, sa, metav1.CreateOptions{})

	if err != nil {
		return nil, err
	}

	k.logger.Info("Service account created correctly in k8s", "serviceAccountName", serviceAccount.Name)

	// Create secret
	k.logger.Info("Creating secret service account token for user in k8s...", "serviceAccountSecretName", saSecretName, "username", usernameSlug)
	secret := v1.Secret{
		TypeMeta: metav1.TypeMeta{},
		ObjectMeta: metav1.ObjectMeta{
			Name: saSecretName,
			Annotations: map[string]string{
				"kubernetes.io/service-account.name": k.getUserServiceAccountName(usernameSlug),
			},
		},
		Type: v1.SecretTypeServiceAccountToken,
	}

	_, err = k.clientset.CoreV1().Secrets(k.cfg.Kubernetes.Namespace).Create(ctx, &secret, metav1.CreateOptions{})
	if err != nil {
		return nil, err
	}

	k.logger.Info("Secret service account token created correctly in k8s", "secretName", secret.Name)

	return serviceAccount, nil
}

// DeleteUserServiceAccount deletes a serviceAccount.
func (k *k8sClient) DeleteUserServiceAccount(ctx context.Context, usernameSlug string) error {
	k.logger.Info("Deleting service account for user in k8s...", "username", usernameSlug)

	saName := k.getUserServiceAccountName(usernameSlug)

	err := k.clientset.CoreV1().ServiceAccounts(k.cfg.Kubernetes.Namespace).Delete(ctx, saName, metav1.DeleteOptions{})
	if err != nil {
		return err
	}

	return nil
}

// GetUserServiceAccount returns the serviceAccount for the given user.
func (k *k8sClient) GetUserServiceAccount(ctx context.Context, usernameSlug string) (*v1.ServiceAccount, error) {
	serviceAccountName := k.getUserServiceAccountName(usernameSlug)

	serviceAccount, err := k.clientset.CoreV1().ServiceAccounts(k.cfg.Kubernetes.Namespace).Get(ctx, serviceAccountName, metav1.GetOptions{})
	if err != nil {
		return nil, err
	}

	return serviceAccount, nil
}
