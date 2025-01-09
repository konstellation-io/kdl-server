package kdlutil

import (
	"errors"

	"gopkg.in/yaml.v3"
	v1 "k8s.io/api/core/v1"
)

var errKeyNotString = errors.New("key is not a string")
var errTemplateKeyNotFound = errors.New("template key not found in ConfigMap data")

func GetCrdTemplateFromConfigMap(configMap *v1.ConfigMap) (map[string]interface{}, error) {
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

	crd, err := convertToStringMap(raw)
	if err != nil {
		return nil, err
	}

	return crd, nil
}

func convertToStringMap(input map[interface{}]interface{}) (map[string]interface{}, error) {
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
			convertedValue, err := convertToStringMap(value)

			if err != nil {
				return nil, err
			}

			result[strKey] = convertedValue
		case []interface{}:
			convertedValue, err := convertToStringSlice(value)

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

func convertToStringSlice(input []interface{}) ([]interface{}, error) {
	for i, v := range input {
		if subMap, isMap := v.(map[interface{}]interface{}); isMap {
			convertedValue, err := convertToStringMap(subMap)

			if err != nil {
				return nil, err
			}

			input[i] = convertedValue
		} else if subSlice, isSlice := v.([]interface{}); isSlice {
			convertedValue, err := convertToStringSlice(subSlice)

			if err != nil {
				return nil, err
			}

			input[i] = convertedValue
		}
	}

	return input, nil
}
