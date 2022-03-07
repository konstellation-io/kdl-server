package k8s

import (
	"context"
	"fmt"

	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// newServiceAccount conform a new k8s serviceAccount.
func (k *k8sClient) newServiceAccount(usernameSlug string) *v1.ServiceAccount {
	return &v1.ServiceAccount{ObjectMeta: metav1.ObjectMeta{Name: k.getUserServiceAccountName(usernameSlug)}}
}

// getUserServiceAccountName returns the name of the service account for a given user.
func (k k8sClient) getUserServiceAccountName(usernameSlug string) string {
	return fmt.Sprintf("%s-service-account", usernameSlug)
}

// CreateUserServiceAccount creates a new k8s serviceAccount for a user.
func (k *k8sClient) CreateUserServiceAccount(ctx context.Context, usernameSlug string) (*v1.ServiceAccount, error) {
	k.logger.Infof("Creating service account for user \"%s\" in k8s...", usernameSlug)

	sa := k.newServiceAccount(usernameSlug)

	serviceAccount, err := k.clientset.CoreV1().ServiceAccounts(k.cfg.Kubernetes.Namespace).Create(ctx, sa, metav1.CreateOptions{})
	if err != nil {
		return nil, err
	}

	k.logger.Infof("The service account \"%s\" was created in k8s correctly", serviceAccount.Name)

	return serviceAccount, nil
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
