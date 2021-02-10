package k8s

import (
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
	coreV1 "k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
)

type k8sClient struct {
	logger    logging.Logger
	clientset *kubernetes.Clientset
	ns        string
}

func NewK8sClient(logger logging.Logger, ns string) (K8sClient, error) {
	kubeConfig, err := rest.InClusterConfig()
	if err != nil {
		return nil, err
	}

	clientset, err := kubernetes.NewForConfig(kubeConfig)
	if err != nil {
		return nil, err
	}

	c := &k8sClient{
		logger:    logger,
		clientset: clientset,
		ns:        ns,
	}

	return c, nil
}

func (k *k8sClient) CreateSecret(name string, values map[string]string) error {
	k.logger.Infof("Creating secret \"%s\" in k8s...", name)

	secretData := map[string][]byte{}
	for key, val := range values {
		secretData[key] = []byte(val)
	}

	secret := &coreV1.Secret{
		TypeMeta: metaV1.TypeMeta{},
		ObjectMeta: metaV1.ObjectMeta{
			Name: name,
		},
		Data: secretData,
	}

	createdSecret, err := k.clientset.CoreV1().Secrets(k.ns).Create(secret)
	if err != nil {
		return err
	}

	k.logger.Infof("The secret \"%s\" was created in k8s correctly", createdSecret.Name)

	return nil
}
