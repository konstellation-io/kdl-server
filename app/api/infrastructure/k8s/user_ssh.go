package k8s

import (
	"context"
	"fmt"

	"github.com/konstellation-io/kdl-server/app/api/entity"
)

const (
	KdlUserPrivateSSHKey = "KDL_USER_PRIVATE_SSH_KEY"
	KdlUserPublicSSHKey  = "KDL_USER_PUBLIC_SSH_KEY"
)

// getUserSSHSecretName returns the name of the SSH keys secret for a given user.
func (k Client) getUserSSHSecretName(usernameSlug string) string {
	return fmt.Sprintf("%s-ssh-keys", usernameSlug)
}

// newUserSSHSecret returns the name and the k8s secret for public and private SSH keys.
func (k *Client) newUserSSHSecret(user entity.User, public, private string) (secretName string, secretValues map[string]string) {
	secretName = k.getUserSSHSecretName(user.UsernameSlug())
	secretValues = map[string]string{
		KdlUserPublicSSHKey:  public,
		KdlUserPrivateSSHKey: private,
	}

	return secretName, secretValues
}

// CreateUserSSHKeySecret creates the user SSH keys secret in k8s.
func (k *Client) CreateUserSSHKeySecret(ctx context.Context, user entity.User, public, private string) error {
	secretName, k8sKeys := k.newUserSSHSecret(user, public, private)
	return k.CreateSecret(ctx, secretName, k8sKeys)
}

// UpdateUserSSHKeySecret updates the user SSH keys secret in k8s.
func (k *Client) UpdateUserSSHKeySecret(ctx context.Context, user entity.User, public, private string) error {
	secretName, k8sKeys := k.newUserSSHSecret(user, public, private)
	return k.UpdateSecret(ctx, secretName, k8sKeys)
}

// GetUserSSHKeySecret returns private SSH key for the given user.
func (k *Client) GetUserSSHKeySecret(ctx context.Context, usernameSlug string) ([]byte, error) {
	sshKeysSecret, err := k.GetSecret(ctx, k.getUserSSHSecretName(usernameSlug))
	if err != nil {
		return nil, err
	}

	privateSSHKey := sshKeysSecret[KdlUserPrivateSSHKey]

	return privateSSHKey, nil
}

// GetUserSSHKeyPublic returns public SSH key for the given user.
func (k *Client) GetUserSSHKeyPublic(ctx context.Context, usernameSlug string) ([]byte, error) {
	sshKeysSecret, err := k.GetSecret(ctx, k.getUserSSHSecretName(usernameSlug))
	if err != nil {
		return nil, err
	}

	publicSSHKey := sshKeysSecret[KdlUserPublicSSHKey]

	return publicSSHKey, nil
}
