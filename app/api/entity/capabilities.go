package entity

import (
	"fmt"
)

type tolerationOperator string

const (
	TolerationOpExists tolerationOperator = "Exists"
	TolerationOpEqual  tolerationOperator = "Equal"
)

var isTolerationOperator = map[string]bool{
	string(TolerationOpExists): true,
	string(TolerationOpEqual):  true,
}

type taintEffect string

const (
	TaintEffectNoSchedule       taintEffect = "NoSchedule"
	TaintEffectPreferNoSchedule taintEffect = "PreferNoSchedule"
	TaintEffectNoExecute        taintEffect = "NoExecute"
)

var isTaintEffect = map[string]bool{
	string(TaintEffectNoSchedule):       true,
	string(TaintEffectPreferNoSchedule): true,
	string(TaintEffectNoExecute):        true,
}

// Capabilities entity definition.
type Capabilities struct {
	ID            string                   `bson:"_id"`
	Name          string                   `bson:"name"`
	Default       bool                     `bson:"default"`
	NodeSelectors map[string]string        `bson:"node_selectors"`
	Tolerations   []map[string]interface{} `bson:"tolerations"`
	Affinities    map[string]interface{}   `bson:"affinities"`
}

func (c Capabilities) DeepCopy() Capabilities {
	capabilityCopy := Capabilities{
		ID:            c.ID,
		Name:          c.Name,
		Default:       c.Default,
		NodeSelectors: make(map[string]string),
		Tolerations:   make([]map[string]interface{}, len(c.Tolerations)),
		Affinities:    make(map[string]interface{}),
	}
	if !c.IsNodeSelectorsEmpty() {
		for key, value := range c.NodeSelectors {
			capabilityCopy.NodeSelectors[key] = value
		}
	}
	if !c.IsTolerationsEmpty() {
		for idx := range c.Tolerations {
			capabilityCopy.Tolerations[idx] = make(map[string]interface{})
			for key, value := range c.Tolerations[idx] {
				capabilityCopy.Tolerations[idx][key] = value
			}
		}
	}
	if !c.IsAffinitiesEmpty() {
		for key, value := range c.Affinities {
			capabilityCopy.Affinities[key] = value
		}
	}
	return capabilityCopy
}

func (c Capabilities) Validate() error {
	nodeSelectorsIsEmpty := c.IsNodeSelectorsEmpty()
	tolerationsIsEmpty := c.IsTolerationsEmpty()
	affinitiesIsEmpty := c.IsAffinitiesEmpty()

	if nodeSelectorsIsEmpty && tolerationsIsEmpty && affinitiesIsEmpty {
		return wrapCapabilitiesNotValidErr(
			fmt.Errorf("capabilities must contain one of these values: nodeSelector, toleration, affinities"),
		)
	}

	if c.Name == "" {
		return wrapCapabilitiesNotValidErr(
			fmt.Errorf("capabilities must have a name"),
		)
	}

	if !tolerationsIsEmpty {
		for _, toleration := range c.Tolerations {
			err := checkToleration(toleration)
			if err != nil {
				return wrapCapabilitiesNotValidErr(err)
			}
		}
	}

	return nil
}

func checkToleration(toleration map[string]interface{}) error {
	err := checkTolerationKey(toleration)
	if err != nil {
		return err
	}

	operator, err := checkTolerationOperator(toleration)
	if err != nil {
		return err
	}

	err = checkTolerationValue(toleration, operator)
	if err != nil {
		return err
	}

	err = checkTolerationEffect(toleration)
	if err != nil {
		return err
	}

	err = checkTolerationSeconds(toleration)
	if err != nil {
		return err
	}

	return nil
}

func checkTolerationKey(toleration map[string]interface{}) error {
	keyRaw, ok := toleration["key"]
	key := fmt.Sprintf("%v", keyRaw)
	if !ok || key == "" {
		return fmt.Errorf("toleration has no key assigned")
	}
	return nil
}

func checkTolerationOperator(toleration map[string]interface{}) (string, error) {
	operatorRaw, ok := toleration["operator"]
	operator := fmt.Sprintf("%v", operatorRaw)
	if !ok || operator == "" {
		return "", fmt.Errorf("toleration has no operator assigned")
	} else {
		if !isTolerationOperator[operator] {
			return "", fmt.Errorf("toleration operator '%s' is not a valid operator", operator)
		}
	}
	return operator, nil
}

func checkTolerationValue(toleration map[string]interface{}, operator string) error {
	valueRaw, ok := toleration["value"]
	value := fmt.Sprintf("%v", valueRaw)
	if operator == string(TolerationOpEqual) && (!ok || value == "") {
		return fmt.Errorf("toleration has no value assigned while operator being 'equal'")
	} else if operator == string(TolerationOpExists) && ok && value != "" {
		return fmt.Errorf("toleration has a value assigned while operator being 'exists'")
	}
	return nil
}

func checkTolerationEffect(toleration map[string]interface{}) error {
	effectRaw, ok := toleration["effect"]
	effect := fmt.Sprintf("%v", effectRaw)
	if !ok || effect == "" {
		return fmt.Errorf("toleration has no effect assigned")
	} else {
		if !isTaintEffect[effect] {
			return fmt.Errorf("toleration effect '%s' is not a valid effect", effect)
		}
	}
	return nil
}

func checkTolerationSeconds(toleration map[string]interface{}) error {
	seconds, ok := toleration["tolerationSeconds"] // optional
	if ok {
		_, isNumber := seconds.(int64)
		if !isNumber {
			return fmt.Errorf("toleration field 'tolerationSeconds' '%v' is not a valid number", seconds)
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
