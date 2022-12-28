package entity_test

import (
	"errors"
	"reflect"
	"testing"

	"github.com/konstellation-io/kdl-server/app/api/entity"

	"github.com/stretchr/testify/suite"
)

type CapabilitiesTestSuite struct {
	suite.Suite
}

func TestContextMeasurementTestSuite(t *testing.T) {
	suite.Run(t, new(CapabilitiesTestSuite))
}

const WrongExample = "Wrong"

func getTestCapability() entity.Capabilities {
	return entity.Capabilities{
		ID:      "test_id",
		Name:    "Test capability",
		Default: false,
		NodeSelectors: map[string]string{
			"test1": "value1",
		},
		Tolerations: []map[string]interface{}{
			{
				"key":               "key1",
				"operator":          "Equal",
				"value":             "value1",
				"effect":            "NoExecute",
				"tolerationSeconds": int64(100),
			},
		},
		Affinities: map[string]interface{}{},
	}
}

func getTestCapability2() entity.Capabilities {
	return entity.Capabilities{
		ID:      "test_id2",
		Name:    "Test capability 2",
		Default: false,
		NodeSelectors: map[string]string{
			"test2": "value2",
		},
		Tolerations: []map[string]interface{}{
			{
				"key":      "key2",
				"operator": "Exists",
				"effect":   "NoSchedule",
			},
		},
		Affinities: map[string]interface{}{},
	}
}

func (testSuite *CapabilitiesTestSuite) TestCapabilitiesNodeSelector() {
	// GIVEN a capability
	capability := getTestCapability()

	// WHEN the capability is retrieved
	nodeSelectors := capability.GetNodeSelectors()

	// THEN the node selectors field is well retrieved
	testSuite.Require().True(reflect.DeepEqual(nodeSelectors, map[string]string{"test1": "value1"}))
}

func (testSuite *CapabilitiesTestSuite) TestCapabilitiesValidateCorrect() {
	// GIVEN a correct capability
	capability := getTestCapability()

	// WHEN validated
	err := capability.Validate()

	// THEN is correct
	testSuite.NoError(err)
}

func (testSuite *CapabilitiesTestSuite) TestCapabilitiesValidateCorrect2() {
	// GIVEN a correct capability
	capability := getTestCapability2()

	// WHEN validated
	err := capability.Validate()

	// THEN is correct
	testSuite.NoError(err)
}

func (testSuite *CapabilitiesTestSuite) TestCapabilitiesValidateCorrectValueEmptyWhenExists() {
	// GIVEN a correct capability
	capability := getTestCapability2()
	capability.Tolerations[0]["value"] = ""

	// WHEN validated
	err := capability.Validate()

	// THEN is correct
	testSuite.NoError(err)
}

func (testSuite *CapabilitiesTestSuite) TestCapabilitiesValidateNoName() {
	// GIVEN an incorrect capability with no name
	wrongCapability := getTestCapability()
	wrongCapability.Name = ""
	// WHEN validated
	err := wrongCapability.Validate()
	// THEN an error promts
	testSuite.Require().Error(err)
	testSuite.True(errors.Is(err, entity.ErrCapabilitiesNotValid))
	testSuite.Equal("capabilities not valid: capabilities must have a name", err.Error())
}

func (testSuite *CapabilitiesTestSuite) TestCapabilitiesValidateNoParameters() {
	// GIVEN an incorrect capability with no parameters
	wrongCapability := getTestCapability()
	wrongCapability.NodeSelectors = map[string]string{}
	wrongCapability.Tolerations = []map[string]interface{}{}
	wrongCapability.Affinities = map[string]interface{}{}
	// WHEN validated
	err := wrongCapability.Validate()
	// THEN an error promts
	testSuite.Require().Error(err)
	testSuite.True(errors.Is(err, entity.ErrCapabilitiesNotValid))
	testSuite.Equal("capabilities not valid: capabilities must contain one of these values: nodeSelector, toleration, affinities", err.Error())
}

func (testSuite *CapabilitiesTestSuite) checkNoAttribute(attribute string) {
	// GIVEN an incorrect capability with empty 'attribute' in tolerations
	wrongCapability := getTestCapability()
	wrongCapability.Tolerations[0][attribute] = ""
	// WHEN validated
	err := wrongCapability.Validate()
	// THEN an error promts
	testSuite.Require().Error(err)
	testSuite.True(errors.Is(err, entity.ErrCapabilitiesNotValid))
	testSuite.Equal("capabilities not valid: toleration has no "+attribute+" assigned", err.Error())

	// GIVEN an incorrect capability with no 'attribute' in tolerations
	delete(wrongCapability.Tolerations[0], attribute)
	// WHEN validated
	err = wrongCapability.Validate()
	// THEN an error promts
	testSuite.Require().Error(err)
	testSuite.True(errors.Is(err, entity.ErrCapabilitiesNotValid))
	testSuite.Equal("capabilities not valid: toleration has no "+attribute+" assigned", err.Error())
}

func (testSuite *CapabilitiesTestSuite) TestCapabilitiesValidateNoTolerationKey() {
	testSuite.checkNoAttribute("key")
}

func (testSuite *CapabilitiesTestSuite) TestCapabilitiesValidateNoTolerationOperator() {
	testSuite.checkNoAttribute("operator")
}

func (testSuite *CapabilitiesTestSuite) TestCapabilitiesValidateInvalidTolerationOperator() {
	// GIVEN an incorrect capability with wrong operator in tolerations
	wrongCapability := getTestCapability()
	wrongCapability.Tolerations[0]["operator"] = WrongExample
	// WHEN validated
	err := wrongCapability.Validate()
	// THEN an error promts
	testSuite.Require().Error(err)
	testSuite.True(errors.Is(err, entity.ErrCapabilitiesNotValid))
	testSuite.Equal("capabilities not valid: toleration operator 'Wrong' is not a valid operator", err.Error())
}

func (testSuite *CapabilitiesTestSuite) TestCapabilitiesValidateNoTolerationValueForEquals() {
	// GIVEN an incorrect capability with empty value and "Equal" operator in tolerations
	wrongCapability := getTestCapability()
	wrongCapability.Tolerations[0]["operator"] = "Equal"
	wrongCapability.Tolerations[0]["value"] = ""
	// WHEN validated
	err := wrongCapability.Validate()
	// THEN an error promts
	testSuite.Require().Error(err)
	testSuite.True(errors.Is(err, entity.ErrCapabilitiesNotValid))
	testSuite.Equal("capabilities not valid: toleration has no value assigned while operator being 'equal'", err.Error())

	// GIVEN an incorrect capability with no value and "Equal" operator in tolerations
	delete(wrongCapability.Tolerations[0], "value")
	// WHEN validated
	err = wrongCapability.Validate()
	// THEN an error promts
	testSuite.Require().Error(err)
	testSuite.True(errors.Is(err, entity.ErrCapabilitiesNotValid))
	testSuite.Equal("capabilities not valid: toleration has no value assigned while operator being 'equal'", err.Error())
}

func (testSuite *CapabilitiesTestSuite) TestCapabilitiesValidateTolerationValueForExist() {
	// GIVEN an incorrect capability with a value and "Exists" operator in tolerations
	wrongCapability := getTestCapability()
	wrongCapability.Tolerations[0]["operator"] = "Exists"
	wrongCapability.Tolerations[0]["value"] = WrongExample
	// WHEN validated
	err := wrongCapability.Validate()
	// THEN an error promts
	testSuite.Require().Error(err)
	testSuite.True(errors.Is(err, entity.ErrCapabilitiesNotValid))
	testSuite.Equal("capabilities not valid: toleration has a value assigned while operator being 'exists'", err.Error())
}

func (testSuite *CapabilitiesTestSuite) TestCapabilitiesValidateNoTolerationEffect() {
	testSuite.checkNoAttribute("operator")
}

func (testSuite *CapabilitiesTestSuite) TestCapabilitiesValidateInvalidTolerationEffeect() {
	// GIVEN an incorrect capability with wrong effect in tolerations
	wrongCapability := getTestCapability()
	wrongCapability.Tolerations[0]["effect"] = WrongExample
	// WHEN validated
	err := wrongCapability.Validate()
	// THEN an error promts
	testSuite.Require().Error(err)
	testSuite.True(errors.Is(err, entity.ErrCapabilitiesNotValid))
	testSuite.Equal("capabilities not valid: toleration effect 'Wrong' is not a valid effect", err.Error())
}

func (testSuite *CapabilitiesTestSuite) TestCapabilitiesValidateInvalidTolerationSeconds() {
	// GIVEN an incorrect capability with wrong toleration seconds in tolerations
	wrongCapability := getTestCapability()
	wrongCapability.Tolerations[0]["tolerationSeconds"] = "Wrong"
	// WHEN validated
	err := wrongCapability.Validate()
	// THEN an error promts
	testSuite.Require().Error(err)
	testSuite.True(errors.Is(err, entity.ErrCapabilitiesNotValid))
	testSuite.Equal("capabilities not valid: toleration field 'tolerationSeconds' 'Wrong' is not a valid number", err.Error())
}
