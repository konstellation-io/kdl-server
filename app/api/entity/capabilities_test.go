package entity_test

import (
	"reflect"
	"testing"

	"github.com/konstellation-io/kdl-server/app/api/entity"
)

func TestCapabilitiesNodeSelector(t *testing.T) {
	capability := &entity.Capabilities{
		ID:      "test_id",
		Name:    "Test capability",
		Default: false,
		NodeSelectors: map[string]string{
			"test1": "value1",
		},
		Affinities: []string{},
		Taints:     []string{},
	}

	nodeSelectors := capability.GetNodeSelectors()

	if !reflect.DeepEqual(nodeSelectors, map[string]string{"test1": "value1"}) {
		t.Errorf("The NodeSelector has not the expected values")
	}
}
