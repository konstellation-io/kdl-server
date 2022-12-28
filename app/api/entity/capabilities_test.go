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

var _testCapability = entity.Capabilities{
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

var _testCapability2 = entity.Capabilities{
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

const WrongExample = "Wrong"

func (testSuite *CapabilitiesTestSuite) TestCapabilitiesNodeSelector() {
	// GIVEN a capability
	capability := _testCapability.DeepCopy()

	// WHEN the capability is retrieved
	nodeSelectors := capability.GetNodeSelectors()

	// THEN the node selectors field is well retrieved
	testSuite.Require().True(reflect.DeepEqual(nodeSelectors, map[string]string{"test1": "value1"}))
}

func (testSuite *CapabilitiesTestSuite) TestCapabilitiesValidateCorrect() {
	// GIVEN a correct capability
	capability := _testCapability.DeepCopy()

	// WHEN validated
	err := capability.Validate()

	// THEN is correct
	testSuite.NoError(err)
}

func (testSuite *CapabilitiesTestSuite) TestCapabilitiesValidateCorrect2() {
	// GIVEN a correct capability
	capability := _testCapability2.DeepCopy()

	// WHEN validated
	err := capability.Validate()

	// THEN is correct
	testSuite.NoError(err)
}

func (testSuite *CapabilitiesTestSuite) TestCapabilitiesValidateCorrectValueEmptyWhenExists() {
	// GIVEN a correct capability
	capability := _testCapability2.DeepCopy()
	capability.Tolerations[0]["value"] = ""

	// WHEN validated
	err := capability.Validate()

	// THEN is correct
	testSuite.NoError(err)
}

func (testSuite *CapabilitiesTestSuite) TestCapabilitiesValidateNoName() {
	// GIVEN an incorrect capability with no name
	wrongCapability := _testCapability.DeepCopy()
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
	wrongCapability := _testCapability.DeepCopy()
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

func (testSuite *CapabilitiesTestSuite) TestCapabilitiesValidateNoTolerationKey() {
	// GIVEN an incorrect capability with empty key in tolerations
	wrongCapability := _testCapability.DeepCopy()
	wrongCapability.Tolerations[0]["key"] = ""
	// WHEN validated
	err := wrongCapability.Validate()
	// THEN an error promts
	testSuite.Require().Error(err)
	testSuite.True(errors.Is(err, entity.ErrCapabilitiesNotValid))
	testSuite.Equal("capabilities not valid: toleration has no key assigned", err.Error())

	// GIVEN an incorrect capability with no key in tolerations
	delete(wrongCapability.Tolerations[0], "key")
	// WHEN validated
	err = wrongCapability.Validate()
	// THEN an error promts
	testSuite.Require().Error(err)
	testSuite.True(errors.Is(err, entity.ErrCapabilitiesNotValid))
	testSuite.Equal("capabilities not valid: toleration has no key assigned", err.Error())
}

func (testSuite *CapabilitiesTestSuite) TestCapabilitiesValidateNoTolerationOperator() {
	// GIVEN an incorrect capability with empty operator in tolerations
	wrongCapability := _testCapability.DeepCopy()
	wrongCapability.Tolerations[0]["operator"] = ""
	// WHEN validated
	err := wrongCapability.Validate()
	// THEN an error promts
	testSuite.Require().Error(err)
	testSuite.True(errors.Is(err, entity.ErrCapabilitiesNotValid))
	testSuite.Equal("capabilities not valid: toleration has no operator assigned", err.Error())

	// GIVEN an incorrect capability with no operator in tolerations
	delete(wrongCapability.Tolerations[0], "operator")
	// WHEN validated
	err = wrongCapability.Validate()
	// THEN an error promts
	testSuite.Require().Error(err)
	testSuite.True(errors.Is(err, entity.ErrCapabilitiesNotValid))
	testSuite.Equal("capabilities not valid: toleration has no operator assigned", err.Error())
}

func (testSuite *CapabilitiesTestSuite) TestCapabilitiesValidateInvalidTolerationOperator() {
	// GIVEN an incorrect capability with wrong operator in tolerations
	wrongCapability := _testCapability.DeepCopy()
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
	wrongCapability := _testCapability.DeepCopy()
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
	wrongCapability := _testCapability.DeepCopy()
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
	// GIVEN an incorrect capability with empty effect in tolerations
	wrongCapability := _testCapability.DeepCopy()
	wrongCapability.Tolerations[0]["effect"] = ""
	// WHEN validated
	err := wrongCapability.Validate()
	// THEN an error promts
	testSuite.Require().Error(err)
	testSuite.True(errors.Is(err, entity.ErrCapabilitiesNotValid))
	testSuite.Equal("capabilities not valid: toleration has no effect assigned", err.Error())

	// GIVEN an incorrect capability with no effect in tolerations
	delete(wrongCapability.Tolerations[0], "effect")
	// WHEN validated
	err = wrongCapability.Validate()
	// THEN an error promts
	testSuite.Require().Error(err)
	testSuite.True(errors.Is(err, entity.ErrCapabilitiesNotValid))
	testSuite.Equal("capabilities not valid: toleration has no effect assigned", err.Error())
}

func (testSuite *CapabilitiesTestSuite) TestCapabilitiesValidateInvalidTolerationEffeect() {
	// GIVEN an incorrect capability with wrong effect in tolerations
	wrongCapability := _testCapability.DeepCopy()
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
	wrongCapability := _testCapability.DeepCopy()
	wrongCapability.Tolerations[0]["tolerationSeconds"] = "Wrong"
	// WHEN validated
	err := wrongCapability.Validate()
	// THEN an error promts
	testSuite.Require().Error(err)
	testSuite.True(errors.Is(err, entity.ErrCapabilitiesNotValid))
	testSuite.Equal("capabilities not valid: toleration field 'tolerationSeconds' 'Wrong' is not a valid number", err.Error())
}
