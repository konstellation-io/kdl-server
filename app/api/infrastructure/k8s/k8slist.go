package k8s

import (
	"encoding/base64"
	"fmt"

	"gopkg.in/yaml.v3"
)

func (k *k8sClient) getK8sList(base64List string) ([]map[string]string, error) {
	decodedK8sList, err := base64.StdEncoding.DecodeString(base64List)
	if err != nil {
		return nil, fmt.Errorf("error decoding list: %w", err)
	}

	k8sList := []map[string]string{}

	err = yaml.Unmarshal(decodedK8sList, &k8sList)
	if err != nil {
		return nil, fmt.Errorf("error unmarshaling list: %w", err)
	}

	return k8sList, nil
}
