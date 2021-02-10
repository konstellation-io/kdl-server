package k8s

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

// K8sClient defines all operation related to Kubernetes.
type K8sClient interface {
	CreateSecret(name string, values map[string]string) error
}
