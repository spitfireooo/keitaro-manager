package keitaro

import (
	"context"
	"fmt"
	"net/http"
)

type CreateCampaignInput struct {
	Name            string `json:"name"`
	Alias           string `json:"alias"`
	Type            string `json:"type"`
	DomainID        int64  `json:"domain_id"`
	GroupID         int64  `json:"group_id,string"`
	TrafficSourceID int64  `json:"traffic_source_id"`
}

type Campaign struct {
	ID    int64  `json:"id"`
	Name  string `json:"name"`
	Alias string `json:"alias"`
}

type CreateStreamInput struct {
	CampaignID    int64          `json:"campaign_id"`
	Name          string         `json:"name"`
	Type          string         `json:"type"`
	Schema        string         `json:"schema"`
	Position      int            `json:"position"`
	ActionType    string         `json:"action_type,omitempty"`
	ActionPayload string         `json:"action_payload,omitempty"`
	Filters       []StreamFilter `json:"filters,omitempty"`
	Offers        []StreamOffer  `json:"offers,omitempty"`
}

type StreamFilter struct {
	Name    string   `json:"name"`
	Mode    string   `json:"mode"`
	Payload []string `json:"payload"`
}

type StreamOffer struct {
	OfferID int64  `json:"offer_id"`
	Share   int    `json:"share"`
	State   string `json:"state"`
}

type Stream struct {
	ID         int64         `json:"id"`
	CampaignID int64         `json:"campaign_id"`
	Name       string        `json:"name"`
	Type       string        `json:"type"`
	Schema     string        `json:"schema"`
	Position   int           `json:"position"`
	Offers     []StreamOffer `json:"offers"`
}

func (c *Client) CreateCampaign(ctx context.Context, input CreateCampaignInput) (Campaign, error) {
	var campaign Campaign
	err := c.doJSON(ctx, http.MethodPost, "/campaigns", input, &campaign)

	return campaign, err
}

func (c *Client) CreateStream(ctx context.Context, input CreateStreamInput) (Stream, error) {
	var stream Stream
	err := c.doJSON(ctx, http.MethodPost, "/streams", input, &stream)

	return stream, err
}

func (c *Client) ListCampaigns(ctx context.Context, offset, limit int) ([]Campaign, error) {
	path := fmt.Sprintf("/campaigns?offset=%d&limit=%d", offset, limit)

	campaigns := make([]Campaign, 0)
	if err := c.doJSON(ctx, http.MethodGet, path, nil, &campaigns); err != nil {
		return nil, err
	}

	return campaigns, nil
}

func (c *Client) ListCampaignStreams(ctx context.Context, campaignID int64) ([]Stream, error) {
	path := fmt.Sprintf("/campaigns/%d/streams", campaignID)

	streams := make([]Stream, 0)
	if err := c.doJSON(ctx, http.MethodGet, path, nil, &streams); err != nil {
		return nil, err
	}

	for i, _ := range streams {
		if streams[i].Offers == nil {
			streams[i].Offers = []StreamOffer{}
		}
	}

	return streams, nil
}

func (c *Client) GetStream(ctx context.Context, streamID int64) (Stream, error) {
	path := fmt.Sprintf("/streams/%d", streamID)

	var stream Stream
	err := c.doJSON(ctx, http.MethodGet, path, nil, &stream)
	return stream, err
}

func (c *Client) UpdateStreamOffers(
	ctx context.Context,
	streamID int64,
	offers []StreamOffer,
) error {
	path := fmt.Sprintf("/streams/%d", streamID)
	input := struct {
		Offers []StreamOffer `json:"offers"`
	}{
		Offers: offers,
	}

	return c.doJSON(ctx, http.MethodPut, path, input, nil)
}

func (c *Client) DeleteCampaign(ctx context.Context, id int64) error {
	return c.doJSON(ctx, http.MethodDelete, fmt.Sprintf("/campaigns/%d", id), nil, nil)
}
