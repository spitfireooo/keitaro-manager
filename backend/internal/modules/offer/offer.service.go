package offer

import (
	"context"

	"github.com/spitfireooo/keitaro-manager/internal/modules/keitaro"
)

type Service struct {
	client *keitaro.Client
}

func NewService(client *keitaro.Client) *Service {
	return &Service{client}
}

func (s *Service) ListOffers(ctx context.Context) ([]keitaro.Offer, error) {
	return s.client.ListOffers(ctx)
}
