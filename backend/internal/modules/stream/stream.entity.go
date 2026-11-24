package stream

type EditorOffer struct {
	OfferID int64  `json:"offer_id"`
	Share   int    `json:"share"`
	State   string `json:"state"`
	Pinned  bool   `json:"pinned"`
}

type EditorState struct {
	PublishedOffers []EditorOffer `json:"published_offers"`
	DraftOffers     []EditorOffer `json:"draft_offers"`
	RemovedOffers   []EditorOffer `json:"removed_offers"`
}
