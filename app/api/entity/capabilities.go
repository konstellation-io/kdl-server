package entity

// Capabilities entity definition.
type Capabilities struct {
	ID            string
	Name          string
	NodeSelectors []map[string]string
	Affinities    []string
	Taints        []string
}

func MockCapabilities() Capabilities {
	return Capabilities{
		ID:   "mock",
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
