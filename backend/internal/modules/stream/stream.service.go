package stream

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"slices"

	"github.com/spitfireooo/keitaro-manager/internal/modules/keitaro"
)

var (
	errStreamNotFound     = errors.New("stream not found in this campaign")
	errStreamNotEditable  = errors.New("stream does not support offers")
	errKeitaroFetch       = errors.New("fetch stream from Keitaro")
	errInvalidOfferID     = errors.New("offer_id must be a positive integer")
	errOfferUnavailable   = errors.New("active offer not found in Keitaro")
	errOfferAlreadyAdded  = errors.New("offer is already in the stream")
	errOfferNotInStream   = errors.New("offer not found in the stream")
	errShareDistribution  = errors.New("offer shares cannot be distributed to 100 percent")
	errStreamChanged      = errors.New("stream offers changed in Keitaro")
	errKeitaroPublish     = errors.New("publish stream offers in Keitaro")
	errPublishUnconfirmed = errors.New("Keitaro did not return the published offers")
)

type Service struct {
	repository *Repository
	client     *keitaro.Client
}

func NewService(repository *Repository, client *keitaro.Client) *Service {
	return &Service{
		repository: repository,
		client:     client,
	}
}

func (s *Service) AddOffer(ctx context.Context, campaignID, streamID, offerID int64) (EditorState, error) {
	if offerID <= 0 {
		return EditorState{}, errInvalidOfferID
	}

	offer, err := s.client.GetOffer(ctx, offerID)
	if err != nil {
		var apiErr *keitaro.APIError
		if errors.As(err, &apiErr) && apiErr.StatusCode == http.StatusNotFound {
			return EditorState{}, errOfferUnavailable
		}
		return EditorState{}, fmt.Errorf("%w: %w", errKeitaroFetch, err)
	}
	if offer.ID != offerID || offer.State != "active" {
		return EditorState{}, errOfferUnavailable
	}

	return s.editDraft(ctx, campaignID, streamID, func(draft []EditorOffer) ([]EditorOffer, error) {
		for _, existing := range draft {
			if existing.OfferID == offerID {
				return nil, errOfferAlreadyAdded
			}
		}

		draft = append(draft, EditorOffer{OfferID: offer.ID, State: "active"})
		return draft, nil
	})
}

func (s *Service) RemoveOffer(ctx context.Context, campaignID, streamID, offerID int64) (EditorState, error) {
	if offerID <= 0 {
		return EditorState{}, errInvalidOfferID
	}

	return s.editDraft(ctx, campaignID, streamID, func(draft []EditorOffer) ([]EditorOffer, error) {
		index := slices.IndexFunc(draft, func(offer EditorOffer) bool {
			return offer.OfferID == offerID
		})
		if index == -1 {
			return nil, errOfferNotInStream
		}

		draft[index] = EditorOffer{OfferID: offerID, State: "removed"}
		return draft, nil
	})
}

func (s *Service) Cancel(ctx context.Context, campaignID, streamID int64) (EditorState, error) {
	return s.repository.ClearDraft(ctx, campaignID, streamID)
}

func (s *Service) editDraft(
	ctx context.Context,
	campaignID, streamID int64,
	edit func([]EditorOffer) ([]EditorOffer, error),
) (EditorState, error) {
	return s.repository.Update(ctx, campaignID, streamID, func(state *EditorState) error {
		remote, err := s.getEditableStream(ctx, campaignID, streamID)
		if err != nil {
			return err
		}

		base := state.DraftOffers
		if base == nil {
			reconcileOffers(state, remote.Offers)
			base = state.PublishedOffers
		}

		draft, err := edit(slices.Clone(base))
		if err != nil {
			return err
		}
		if err := redistributeShares(draft); err != nil {
			return err
		}

		state.DraftOffers = draft
		return nil
	})
}

func (s *Service) Fetch(ctx context.Context, campaignID, streamID int64) (EditorState, error) {
	return s.repository.Update(ctx, campaignID, streamID, func(state *EditorState) error {
		remote, err := s.getEditableStream(ctx, campaignID, streamID)
		if err != nil {
			return err
		}

		if state.DraftOffers == nil {
			reconcileOffers(state, remote.Offers)
		}

		return nil
	})
}

func (s *Service) Publish(ctx context.Context, campaignID, streamID int64) (EditorState, error) {
	return s.repository.Update(ctx, campaignID, streamID, func(state *EditorState) error {
		remote, err := s.getEditableStream(ctx, campaignID, streamID)
		if err != nil {
			return err
		}

		if state.DraftOffers == nil {
			reconcileOffers(state, remote.Offers)
			return nil
		}

		desired := toKeitaroOffers(state.DraftOffers)
		if sameStreamOffers(remote.Offers, desired) {
			confirmPublishedDraft(state, remote.Offers)
			return nil
		}

		if !sameStreamOffers(remote.Offers, toKeitaroOffers(state.PublishedOffers)) {
			return errStreamChanged
		}

		if err := s.client.UpdateStreamOffers(ctx, streamID, desired); err != nil {
			return fmt.Errorf("%w: %w", errKeitaroPublish, err)
		}

		remote, err = s.getEditableStream(ctx, campaignID, streamID)
		if err != nil {
			return err
		}
		if !sameStreamOffers(remote.Offers, desired) {
			return errPublishUnconfirmed
		}

		confirmPublishedDraft(state, remote.Offers)
		return nil
	})
}

func (s *Service) getEditableStream(ctx context.Context, campaignID, streamID int64) (keitaro.Stream, error) {
	remote, err := s.client.GetStream(ctx, streamID)
	if err != nil {
		var apiErr *keitaro.APIError
		if errors.As(err, &apiErr) && apiErr.StatusCode == http.StatusNotFound {
			return keitaro.Stream{}, errStreamNotFound
		}
		return keitaro.Stream{}, fmt.Errorf("%w: %w", errKeitaroFetch, err)
	}

	if remote.ID != streamID || remote.CampaignID != campaignID {
		return keitaro.Stream{}, errStreamNotFound
	}
	if remote.Schema != "landings" {
		return keitaro.Stream{}, errStreamNotEditable
	}

	return remote, nil
}

func reconcileOffers(state *EditorState, remote []keitaro.StreamOffer) {
	previous := make(map[int64]EditorOffer, len(state.PublishedOffers))
	for _, offer := range state.PublishedOffers {
		previous[offer.OfferID] = offer
	}

	current := make(map[int64]struct{}, len(remote))
	published := make([]EditorOffer, 0, len(remote))
	for _, offer := range remote {
		old := previous[offer.OfferID]
		current[offer.OfferID] = struct{}{}

		published = append(published, EditorOffer{
			OfferID: offer.OfferID,
			Share:   offer.Share,
			State:   offer.State,
			Pinned:  old.Pinned && old.Share == offer.Share && offer.State == "active",
		})
	}

	removed := make([]EditorOffer, 0, len(state.RemovedOffers))
	for _, offer := range state.RemovedOffers {
		if _, exists := current[offer.OfferID]; !exists {
			removed = append(removed, offer)
		}
	}
	for _, offer := range state.PublishedOffers {
		if _, exists := current[offer.OfferID]; !exists {
			removed = append(removed, EditorOffer{
				OfferID: offer.OfferID,
				State:   "removed",
			})
		}
	}

	state.PublishedOffers = published
	state.RemovedOffers = removed
}

func redistributeShares(offers []EditorOffer) error {
	remaining := 100
	active := 0
	unpinned := 0

	for _, offer := range offers {
		if offer.State != "active" {
			continue
		}

		active++
		if offer.Pinned {
			remaining -= offer.Share
		} else {
			unpinned++
		}
	}

	if remaining < 0 || (active > 0 && unpinned == 0 && remaining != 0) {
		return errShareDistribution
	}
	if unpinned == 0 {
		return nil
	}

	share, extra := remaining/unpinned, remaining%unpinned
	for i := range offers {
		if offers[i].State != "active" || offers[i].Pinned {
			continue
		}

		offers[i].Share = share
		if extra > 0 {
			offers[i].Share++
			extra--
		}
	}

	return nil
}

func toKeitaroOffers(offers []EditorOffer) []keitaro.StreamOffer {
	result := make([]keitaro.StreamOffer, 0, len(offers))

	for _, offer := range offers {
		if offer.State == "removed" {
			continue
		}

		result = append(result, keitaro.StreamOffer{
			OfferID: offer.OfferID,
			Share:   offer.Share,
			State:   offer.State,
		})
	}

	return result
}

func sameStreamOffers(left, right []keitaro.StreamOffer) bool {
	if len(left) != len(right) {
		return false
	}

	counts := make(map[keitaro.StreamOffer]int, len(left))
	for _, offer := range left {
		counts[offer]++
	}
	for _, offer := range right {
		if counts[offer] == 0 {
			return false
		}
		counts[offer]--
	}

	return true
}

func confirmPublishedDraft(state *EditorState, remote []keitaro.StreamOffer) {
	pinned := make(map[int64]bool, len(state.DraftOffers))
	for _, offer := range state.DraftOffers {
		pinned[offer.OfferID] = offer.Pinned && offer.State == "active"
	}

	reconcileOffers(state, remote)
	for i := range state.PublishedOffers {
		offer := &state.PublishedOffers[i]
		offer.Pinned = pinned[offer.OfferID]
	}

	state.DraftOffers = nil
}
