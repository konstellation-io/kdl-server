package entity

// Capabilities entity definition.
type Capabilities struct {
	ID            string            `bson:"_id"`
	Name          string            `bson:"name"`
	Default       bool              `bson:"default"`
	NodeSelectors map[string]string `bson:"node_selectors"`
	Affinities    []string          `bson:"affinities"`
	Taints        []string          `bson:"taints"`
}

func (c Capabilities) GetNodeSelectors() map[string]string {
	return c.NodeSelectors
}

func (c Capabilities) GetAffinities() map[string]interface{} {
	return map[string]interface{}{
		"affinity": map[string]interface{}{},
	}
}

func (c Capabilities) GetTaints() map[string]interface{} {
	return map[string]interface{}{
		"taints": map[string]interface{}{},
	}
}
