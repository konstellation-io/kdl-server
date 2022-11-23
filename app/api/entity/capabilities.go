package entity

// Capabilities entity definition.
type Capabilities struct {
	ID            string            `bson:"_id"`
	Name          string            `bson:"name"`
	Default       bool              `bson:"default"`
	NodeSelectors map[string]string `bson:"node_selectors"` // TODO validate schema matches this
	Affinities    []string          `bson:"affinities"`     // TODO replace with struct
	Taints        []string          `bson:"taints"`         // TODO replace with struct
}

func (c Capabilities) GetNodeSelectors() map[string]string {
	return c.NodeSelectors
}

func (c Capabilities) GetAffinities() map[string]interface{} {
	//TODO model affinities object
	return map[string]interface{}{
		"affinity": map[string]interface{}{},
	}
}

func (c Capabilities) GetTaints() map[string]interface{} {
	// TODO model tains object
	return map[string]interface{}{
		"taints": map[string]interface{}{},
	}
}
