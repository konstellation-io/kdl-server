package k8s

import (
	"context"
	"fmt"

	v1 "k8s.io/api/core/v1"
	k8errors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// newServiceAccount conform a new k8s serviceAccount.
func (k *Client) newServiceAccount(usernameSlug, secretName string) *v1.ServiceAccount {
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
func (k *Client) getUserServiceAccountName(usernameSlug string) string {
	return fmt.Sprintf("%s-service-account", usernameSlug)
}

// getServiceAccountSecretName returns the name of the service account secret for a given user.
func (k *Client) getServiceAccountSecretName(usernameSlug string) string {
	return fmt.Sprintf("%s-service-account-secret", usernameSlug)
}

func (k *Client) updateAutomountExistingServiceAccount(
	ctx context.Context, serviceAccount *v1.ServiceAccount, saSecretName, usernameSlug string,
) (*v1.ServiceAccount, error) {
	// Update the service account
	k.logger.Info("Updating service account in k8s...", "name", serviceAccount.Name)

	automountServiceAccountToken := true
	serviceAccount.AutomountServiceAccountToken = &automountServiceAccountToken
	serviceAccount.Secrets = []v1.ObjectReference{
		{
			Name: saSecretName,
		},
	}

	serviceAccount, err := k.clientset.CoreV1().ServiceAccounts(k.cfg.Kubernetes.Namespace).Update(ctx, serviceAccount, metav1.UpdateOptions{})
	if err != nil {
		return nil, err
	}

	err = k.createSecretTypeServiceAccountToken(ctx, saSecretName, usernameSlug)

	if err != nil {
		return nil, err
	}

	k.logger.Info("The service account was updated in k8s correctly", "name", serviceAccount.Name)

	return serviceAccount, nil
}

func (k *Client) createSecretTypeServiceAccountToken(ctx context.Context, saSecretName, usernameSlug string) error {
	// Create secret
	k.logger.Info("Creating secret service account token for user in k8s...",
		"serviceAccountSecretName", saSecretName, "username", usernameSlug,
	)

	secret := v1.Secret{
		TypeMeta: metav1.TypeMeta{},
		ObjectMeta: metav1.ObjectMeta{
			Name: saSecretName,
			Labels: map[string]string{
				"konstellation.io/secret-service-account-token": "true",
			},
			Annotations: map[string]string{
				"kubernetes.io/service-account.name": k.getUserServiceAccountName(usernameSlug),
			},
		},
		Type: v1.SecretTypeServiceAccountToken,
	}

	_, err := k.clientset.CoreV1().Secrets(k.cfg.Kubernetes.Namespace).Create(ctx, &secret, metav1.CreateOptions{})
	if err != nil {
		return err
	}

	k.logger.Info("Secret service account token created correctly in k8s", "secretName", secret.Name)

	return nil
}

// CreateUserServiceAccount creates a new k8s serviceAccount for a user.
func (k *Client) CreateUserServiceAccount(ctx context.Context, usernameSlug string) (*v1.ServiceAccount, error) {
	saSecretName := k.getServiceAccountSecretName(usernameSlug)

	serviceAccount, err := k.GetUserServiceAccount(ctx, usernameSlug)

	if err != nil && k8errors.IsNotFound(err) {
		// Create the service account
		k.logger.Info("Creating service account for user in k8s...", "username", usernameSlug)

		sa := k.newServiceAccount(usernameSlug, saSecretName)

		createdSA, err := k.clientset.CoreV1().ServiceAccounts(k.cfg.Kubernetes.Namespace).Create(ctx, sa, metav1.CreateOptions{})
		if err != nil {
			return nil, err
		}

		err = k.createSecretTypeServiceAccountToken(ctx, saSecretName, usernameSlug)
		if err != nil {
			return nil, err
		}

		k.logger.Info("The service account was created in k8s correctly", "name", createdSA.Name)

		return createdSA, nil
	} else if err != nil && !k8errors.IsNotFound(err) {
		return nil, err
	}

	// if service account AutomountServiceAccountToken value is nil, update service account
	if serviceAccount.AutomountServiceAccountToken == nil {
		serviceAccount, err = k.updateAutomountExistingServiceAccount(ctx, serviceAccount, saSecretName, usernameSlug)
		if err != nil {
			return nil, err
		}

		return serviceAccount, nil
	}

	return serviceAccount, nil
}

// DeleteUserServiceAccount delete a serviceAccount.
func (k *Client) DeleteUserServiceAccount(ctx context.Context, usernameSlug string) error {
	k.logger.Info("Deleting service account for user in k8s...", "username", usernameSlug)

	saName := k.getUserServiceAccountName(usernameSlug)

	err := k.clientset.CoreV1().ServiceAccounts(k.cfg.Kubernetes.Namespace).Delete(ctx, saName, metav1.DeleteOptions{})
	if err != nil {
		return err
	}

	return nil
}

// GetUserServiceAccount returns the serviceAccount for the given user.
func (k *Client) GetUserServiceAccount(ctx context.Context, usernameSlug string) (*v1.ServiceAccount, error) {
	serviceAccountName := k.getUserServiceAccountName(usernameSlug)

	serviceAccount, err := k.clientset.CoreV1().ServiceAccounts(k.cfg.Kubernetes.Namespace).Get(ctx, serviceAccountName, metav1.GetOptions{})
	if err != nil {
		return nil, err
	}

	return serviceAccount, nil
}
