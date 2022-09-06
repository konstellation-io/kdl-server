package k8s

import (
	"encoding/base64"
	"fmt"

	"gopkg.in/yaml.v3"
)

func (k *k8sClient) getIngressAnnotations(base64Annotations string) (map[string]interface{}, error) {
	decodedAnnotations, err := base64.StdEncoding.DecodeString(base64Annotations)
	if err != nil {
		return nil, fmt.Errorf("error decoding ingress annotations: %w", err)
	}

	var ingressAnnotations map[string]interface{}

	err = yaml.Unmarshal(decodedAnnotations, &ingressAnnotations)
	if err != nil {
		return nil, fmt.Errorf("error unmarshaling annotations: %w", err)
	}

	return ingressAnnotations, nil
}
