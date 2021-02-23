package entity

type KnowledgeGraphItemCat string

const (
	KnowledgeGraphItemCatPaper KnowledgeGraphItemCat = "Paper"
	KnowledgeGraphItemCatCode  KnowledgeGraphItemCat = "Code"
)

func (e KnowledgeGraphItemCat) IsValid() bool {
	switch e {
	case KnowledgeGraphItemCatPaper, KnowledgeGraphItemCatCode:
		return true
	}

	return false
}

func (e KnowledgeGraphItemCat) String() string {
	return string(e)
}

type KnowledgeGraph struct {
	Items []KnowledgeGraphItem `json:"items"`
}

type KnowledgeGraphItem struct {
	ID          string
	Category    KnowledgeGraphItemCat
	Title       string
	Abstract    string
	Authors     []string
	Date        string
	URL         string
	ExternalID  *string
	Framework   *string
	Score       float64
	IsStarred   bool
	IsDiscarded bool
}
