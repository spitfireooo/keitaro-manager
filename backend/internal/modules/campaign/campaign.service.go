package campaign

import (
	"context"
	"crypto/rand"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/spitfireooo/keitaro-manager/internal/modules/keitaro"
	"golang.org/x/text/language"
)

var (
	errNameRequired   = errors.New("name is required")
	errInvalidCountry = errors.New("country_code must be a valid two-letter country code")
	errInvalidOfferID = errors.New("offer_id must be a positive integer")
	errOfferNotFound  = errors.New("offer not found in Keitaro")
	errOfferDeleted   = errors.New("the selected offer is deleted in Keitaro")
)

type Defaults struct {
	DomainID        int64
	GroupID         int64
	TrafficSourceID int64
}

type CreateInput struct {
	Name        string `json:"name"`
	CountryCode string `json:"country_code"`
	OfferID     int64  `json:"offer_id"`
}

type CreateResult struct {
	keitaro.Campaign
	GeoStreamID   int64 `json:"geo_stream_id"`
	OfferStreamID int64 `json:"offer_stream_id"`
}

type incompleteCreationError struct {
	id    int64
	alias string
	err   error
}

func (e *incompleteCreationError) Error() string {
	return fmt.Sprintf("Keitaro campaign %q (id %d) could be incomplete: %v", e.alias, e.id, e.err)
}

type keitaroClient interface {
	GetOffer(context.Context, int64) (keitaro.Offer, error)
	ListCampaigns(ctx context.Context, offset, limit int) ([]keitaro.Campaign, error)
	ListCampaignStreams(ctx context.Context, campaignID int64) ([]keitaro.Stream, error)
	CreateCampaign(context.Context, keitaro.CreateCampaignInput) (keitaro.Campaign, error)
	CreateStream(context.Context, keitaro.CreateStreamInput) (keitaro.Stream, error)
	DeleteCampaign(context.Context, int64) error
}

type Service struct {
	client   keitaroClient
	defaults Defaults
}

func NewService(client keitaroClient, defaults Defaults) *Service {
	return &Service{client: client, defaults: defaults}
}

func (s *Service) Create(ctx context.Context, input CreateInput) (CreateResult, error) {
	input.Name = strings.TrimSpace(input.Name)
	input.CountryCode = strings.ToUpper(strings.TrimSpace(input.CountryCode))

	if err := input.validate(); err != nil {
		return CreateResult{}, err
	}

	offer, err := s.client.GetOffer(ctx, input.OfferID)
	if hasStatus(err, http.StatusNotFound) {
		return CreateResult{}, errOfferNotFound
	}
	if err != nil {
		return CreateResult{}, err
	}
	if offer.ID != input.OfferID {
		return CreateResult{}, fmt.Errorf("Keitaro returned offer %d for offer ID %d", offer.ID, input.OfferID)
	}
	if offer.State == "deleted" {
		return CreateResult{}, errOfferDeleted
	}

	alias := "km-" + strings.ToLower(rand.Text())
	created, err := s.client.CreateCampaign(ctx, keitaro.CreateCampaignInput{
		Name:            input.Name,
		Alias:           alias,
		Type:            "position",
		DomainID:        s.defaults.DomainID,
		GroupID:         s.defaults.GroupID,
		TrafficSourceID: s.defaults.TrafficSourceID,
	})
	if err != nil {
		var apiErr *keitaro.APIError
		if errors.As(err, &apiErr) && apiErr.StatusCode >= 400 && apiErr.StatusCode < 500 {
			return CreateResult{}, err
		}

		return CreateResult{}, &incompleteCreationError{alias: alias, err: err}
	}
	if created.ID <= 0 {
		return CreateResult{}, &incompleteCreationError{
			alias: alias,
			err:   errors.New("Keitaro did not return a campaign ID"),
		}
	}
	if created.Alias == "" {
		created.Alias = alias
	}
	if created.Name == "" {
		created.Name = input.Name
	}

	geoStream, err := s.client.CreateStream(ctx, keitaro.CreateStreamInput{
		CampaignID:    created.ID,
		Name:          "Geo " + input.CountryCode,
		Type:          "regular",
		Schema:        "redirect",
		Position:      1,
		ActionType:    "http",
		ActionPayload: "https://google.com",
		Filters: []keitaro.StreamFilter{
			{Name: "country", Mode: "accept", Payload: []string{input.CountryCode}},
		},
	})
	if err = streamCreationError("geo", geoStream, err); err != nil {
		return CreateResult{}, s.rollback(ctx, created, err)
	}

	offerStream, err := s.client.CreateStream(ctx, keitaro.CreateStreamInput{
		CampaignID: created.ID,
		Name:       "Офферы",
		Type:       "default",
		Schema:     "landings",
		Position:   2,
		Offers: []keitaro.StreamOffer{
			{OfferID: offer.ID, Share: 100, State: "active"},
		},
	})
	if err = streamCreationError("offer", offerStream, err); err != nil {
		return CreateResult{}, s.rollback(ctx, created, err)
	}

	return CreateResult{
		Campaign:      created,
		GeoStreamID:   geoStream.ID,
		OfferStreamID: offerStream.ID,
	}, nil
}

func (s *Service) List(ctx context.Context, offset, limit int) ([]keitaro.Campaign, error) {
	return s.client.ListCampaigns(ctx, offset, limit)
}

func (s *Service) ListStreams(ctx context.Context, campaignID int64) ([]keitaro.Stream, error) {
	return s.client.ListCampaignStreams(ctx, campaignID)
}

func (input CreateInput) validate() error {
	if input.Name == "" {
		return errNameRequired
	}

	code := input.CountryCode
	if len(code) != 2 || code[0] < 'A' || code[0] > 'Z' || code[1] < 'A' || code[1] > 'Z' {
		return errInvalidCountry
	}
	region, err := language.ParseRegion(code)
	if err != nil || !region.IsCountry() {
		return errInvalidCountry
	}

	if input.OfferID <= 0 {
		return errInvalidOfferID
	}

	return nil
}

func streamCreationError(name string, stream keitaro.Stream, err error) error {
	if err != nil {
		return fmt.Errorf("create %s stream: %w", name, err)
	}
	if stream.ID <= 0 {
		return fmt.Errorf("create %s stream: Keitaro did not return a stream ID", name)
	}

	return nil
}

func (s *Service) rollback(ctx context.Context, created keitaro.Campaign, cause error) error {
	// An abandoned HTTP request should not prevent cleanup.
	err := s.client.DeleteCampaign(context.WithoutCancel(ctx), created.ID)
	if err == nil || hasStatus(err, http.StatusNotFound) {
		return fmt.Errorf("rolled back campaign %d: %w", created.ID, cause)
	}

	return &incompleteCreationError{
		id:    created.ID,
		alias: created.Alias,
		err:   errors.Join(cause, fmt.Errorf("roll back campaign: %w", err)),
	}
}

func hasStatus(err error, status int) bool {
	var apiErr *keitaro.APIError
	return errors.As(err, &apiErr) && apiErr.StatusCode == status
}
