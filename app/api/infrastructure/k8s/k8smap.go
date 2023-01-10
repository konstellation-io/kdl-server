package k8s

import (
	"encoding/base64"
	"fmt"

	"gopkg.in/yaml.v3"
)

func (k *k8sClient) getK8sMap(base64Map string) (map[string]interface{}, error) {
	decodedMap, err := base64.StdEncoding.DecodeString(base64Map)
	if err != nil {
		return nil, fmt.Errorf("error decoding map: %w", err)
	}

	var k8sMap map[string]interface{}

	err = yaml.Unmarshal(decodedMap, &k8sMap)
	if err != nil {
		return nil, fmt.Errorf("error unmarshaling map: %w", err)
	}

	return k8sMap, nil
}
