package k8s

import (
	"errors"

	"gopkg.in/yaml.v3"
	v1 "k8s.io/api/core/v1"
)

var errKeyNotString = errors.New("key is not a string")
var errTemplateKeyNotFound = errors.New("template key not found in ConfigMap data")

func (k *Client) getCrdTemplateFromConfigMap(configMap *v1.ConfigMap) (map[string]interface{}, error) {
	// Get data from ConfigMap template field
	templateData, exists := configMap.Data["template"]

	if !exists {
		return nil, errTemplateKeyNotFound
	}

	// Unmarshal the template data into a map
	var raw map[interface{}]interface{}
	err := yaml.Unmarshal([]byte(templateData), &raw)

	if err != nil {
		return nil, err
	}

	crd, err := k.convertToStringMap(raw)
	if err != nil {
		return nil, err
	}

	return crd, nil
}

func (k *Client) convertToStringMap(input map[interface{}]interface{}) (map[string]interface{}, error) {
	result := make(map[string]interface{})

	for key, value := range input {
		// make sure the key is a string
		strKey, ok := key.(string)

		if !ok {
			return nil, errKeyNotString
		}

		// convert recursively if the value is also a map
		switch value := value.(type) {
		case map[interface{}]interface{}:
			convertedValue, err := k.convertToStringMap(value)

			if err != nil {
				return nil, err
			}

			result[strKey] = convertedValue
		case []interface{}:
			convertedValue, err := k.convertToStringSlice(value)

			if err != nil {
				return nil, err
			}

			result[strKey] = convertedValue
		default:
			result[strKey] = value
		}
	}

	return result, nil
}

func (k *Client) convertToStringSlice(input []interface{}) ([]interface{}, error) {
	for i, v := range input {
		if subMap, isMap := v.(map[interface{}]interface{}); isMap {
			convertedValue, err := k.convertToStringMap(subMap)

			if err != nil {
				return nil, err
			}

			input[i] = convertedValue
		} else if subSlice, isSlice := v.([]interface{}); isSlice {
			convertedValue, err := k.convertToStringSlice(subSlice)

			if err != nil {
				return nil, err
			}

			input[i] = convertedValue
		}
	}

	return input, nil
}
