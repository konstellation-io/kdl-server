package entity

import (
	"fmt"
)

type TolerationOperator string

const (
	TolerationOpExists TolerationOperator = "Exists"
	TolerationOpEqual  TolerationOperator = "Equal"
)

func IsTolerationOperator(operator string) bool {
	var mapOfOperators = map[string]bool{
		string(TolerationOpExists): true,
		string(TolerationOpEqual):  true,
	}

	return mapOfOperators[operator]
}

type TaintEffect string

const (
	TaintEffectNoSchedule       TaintEffect = "NoSchedule"
	TaintEffectPreferNoSchedule TaintEffect = "PreferNoSchedule"
	TaintEffectNoExecute        TaintEffect = "NoExecute"
)

func IsTolerationEffect(effect string) bool {
	var mapOfEffects = map[string]bool{
		string(TaintEffectNoSchedule):       true,
		string(TaintEffectPreferNoSchedule): true,
		string(TaintEffectNoExecute):        true,
	}

	return mapOfEffects[effect]
}

// Capabilities entity definition.
type Capabilities struct {
	ID            string
	Name          string
	Default       bool
	NodeSelectors map[string]string
	Tolerations   []map[string]interface{}
	Affinities    map[string]interface{}
}

func (c Capabilities) Validate() error {
	nodeSelectorsIsEmpty := c.IsNodeSelectorsEmpty()
	tolerationsIsEmpty := c.IsTolerationsEmpty()
	affinitiesIsEmpty := c.IsAffinitiesEmpty()

	if nodeSelectorsIsEmpty && tolerationsIsEmpty && affinitiesIsEmpty {
		return wrapCapabilitiesNotValidErr(ErrCapabilitiesNoParameters)
	}

	if c.Name == "" {
		return wrapCapabilitiesNotValidErr(ErrCapabilitiesNoName)
	}

	if !tolerationsIsEmpty {
		for _, toleration := range c.Tolerations {
			if err := checkToleration(toleration); err != nil {
				return wrapCapabilitiesNotValidErr(err)
			}
		}
	}

	return nil
}

func checkToleration(toleration map[string]interface{}) error {
	if err := checkTolerationKey(toleration); err != nil {
		return err
	}

	if err := checkTolerationOperator(toleration); err != nil {
		return err
	}

	if err := checkTolerationValue(toleration); err != nil {
		return err
	}

	if err := checkTolerationEffect(toleration); err != nil {
		return err
	}

	if err := checkTolerationSeconds(toleration); err != nil {
		return err
	}

	return nil
}

func checkTolerationKey(toleration map[string]interface{}) error {
	keyRaw, ok := toleration["key"]
	key := fmt.Sprintf("%v", keyRaw)

	if !ok || key == "" {
		return ErrCapabilitiesNoKey
	}

	return nil
}

func checkTolerationOperator(toleration map[string]interface{}) error {
	operatorRaw, ok := toleration["operator"]
	operator := fmt.Sprintf("%v", operatorRaw)

	if !ok || operator == "" {
		return ErrCapabilitiesNoOperator
	} else if !IsTolerationOperator(operator) {
		return wrapErrWithValue(ErrCapabilitiesInvalidOperator, operator)
	}

	return nil
}

func checkTolerationValue(toleration map[string]interface{}) error {
	valueRaw, okValue := toleration["value"]
	operatorRaw, okOperator := toleration["operator"]
	value := fmt.Sprintf("%v", valueRaw)
	operator := fmt.Sprintf("%v", operatorRaw)

	if !okOperator {
		return ErrCapabilitiesNoOperator
	}

	if operator == string(TolerationOpEqual) && (!okValue || value == "") {
		return ErrCapabilitiesNoValue
	} else if operator == string(TolerationOpExists) && okValue && value != "" {
		return ErrCapabilitiesHasValue
	}

	return nil
}

func checkTolerationEffect(toleration map[string]interface{}) error {
	effectRaw, ok := toleration["effect"]
	effect := fmt.Sprintf("%v", effectRaw)

	if !ok || effect == "" {
		return ErrCapabilitiesNoEffect
	} else if !IsTolerationEffect(effect) {
		return wrapErrWithValue(ErrCapabilitiesInvalidOperator, effect)
	}

	return nil
}

func checkTolerationSeconds(toleration map[string]interface{}) error {
	seconds, ok := toleration["tolerationSeconds"] // optional

	if ok {
		switch seconds.(type) {
		case int, int32, int64:
		default:
			return wrapErrWithValue(ErrCapabilitiesInvalidSeconds, fmt.Sprintf("%v", seconds))
		}
	}

	return nil
}

func (c Capabilities) IsNodeSelectorsEmpty() bool {
	return len(c.NodeSelectors) == 0
}

func (c Capabilities) IsTolerationsEmpty() bool {
	return len(c.Tolerations) == 0
}

func (c Capabilities) IsAffinitiesEmpty() bool {
	return len(c.Affinities) == 0
}

func (c Capabilities) GetNodeSelectors() map[string]string {
	return c.NodeSelectors
}

func (c Capabilities) GetTolerations() []map[string]interface{} {
	return c.Tolerations
}

func (c Capabilities) GetAffinities() map[string]interface{} {
	return c.Affinities
}
