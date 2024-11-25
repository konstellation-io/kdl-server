package main

import (
	"context"
	"log"
	"os"
	"path/filepath"

	v1 "k8s.io/api/core/v1"
	k8s_errors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
)

// K8s manager for Kuberentes interaction.
type K8s struct {
	client *kubernetes.Clientset
	cfg    Config
}

// NewK8s initialize K8s manager.
func NewK8s(cfg Config) K8s {
	client := newClientset(cfg)

	return K8s{
		client: client,
		cfg:    cfg,
	}
}

// NewClientset return a Kuberentes client.
func newClientset(cfg Config) *kubernetes.Clientset {
	kubeConfig := newKubernetesConfig(cfg)

	// create the clientset
	clientset, err := kubernetes.NewForConfig(kubeConfig)
	if err != nil {
		log.Fatalf("Fatal error kubernetes config: %s", err)
	}

	return clientset
}

func newKubernetesConfig(config Config) *rest.Config {
	if config.Kubernetes.IsInsideCluster {
		log.Printf("Creating K8s config in-cluster")

		kubeConfig, err := rest.InClusterConfig()
		if err != nil {
			log.Fatalf("fatal error kubernetes config: %s", err)
		}

		return kubeConfig
	}

	log.Printf("Creating K8s config from local .kube/config")

	// NOTE: It works only with the default user's config, not even the exported KUBECONFIG value
	kubeConfigPath := filepath.Join(os.Getenv("HOME"), ".kube", "config")

	// use the current context in kubeConfigPath
	kubeConfig, err := clientcmd.BuildConfigFromFlags("", kubeConfigPath)
	if err != nil {
		log.Fatalf("fatal error kubernetes config: %s", err)
	}

	return kubeConfig
}

// IsSecretPresent checks if there is a secret with the given name.
func (k *K8s) IsSecretPresent(ctx context.Context, name string) (bool, error) {
	log.Printf("Checking if secret %q is present\n", name)

	_, err := k.client.CoreV1().Secrets(k.cfg.Kubernetes.Namespace).Get(ctx, name, metav1.GetOptions{})
	if err != nil && !k8s_errors.IsNotFound(err) {
		return false, err
	}

	return !k8s_errors.IsNotFound(err), nil
}

// CreateSecret creates a secret on kubernetes with the given data.
func (k *K8s) CreateSecret(ctx context.Context, name string, input map[string]string) error {
	log.Printf("Creating secret %q...\n", name)

	data := map[string][]byte{}
	for key, v := range input {
		data[key] = []byte(v)
	}

	_, err := k.client.CoreV1().Secrets(k.cfg.Kubernetes.Namespace).Create(ctx, &v1.Secret{
		TypeMeta: metav1.TypeMeta{
			Kind:       "Secret",
			APIVersion: "apps/v1beta1",
		},
		ObjectMeta: metav1.ObjectMeta{
			Name:      name,
			Namespace: k.cfg.Kubernetes.Namespace,
		},
		Data: data,
		Type: "Opaque",
	}, metav1.CreateOptions{})

	return err
}
