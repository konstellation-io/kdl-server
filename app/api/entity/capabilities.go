package entity

// Capabilities entity definition.
type Capabilities struct {
	ID            string              `bson:"_id"`
	Name          string              `bson:"name"`
	NodeSelectors []map[string]string `bson:"node_selectors"` // TODO validate schema matches this
	Affinities    []string            `bson:"affinities"`     // TODO replace with struct
	Taints        []string            `bson:"taints"`         // TODO replace with struct
}

func MockCapabilities() Capabilities { // TODO remove when the repository is implemented
	return Capabilities{
		ID:   "mockCapabilitiesID",
		Name: "mock",
		NodeSelectors: []map[string]string{
			{"selector1": "test1"},
			{"selector2": "test2"},
		},
		Affinities: []string{"affinities1", "affinities2"},
		Taints:     []string{"taints1", "taints2"},
	}
}

func (c Capabilities) GetNodeSelectors() []map[string]string {
	return c.NodeSelectors
}

func (c Capabilities) GetAffinities() map[string]interface{} {
	return map[string]interface{}{
		"affinity": map[string]interface{}{},
	}
}
