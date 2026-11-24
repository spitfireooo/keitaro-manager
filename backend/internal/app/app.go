package app

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/spitfireooo/keitaro-manager/internal/config"
	"github.com/spitfireooo/keitaro-manager/internal/database"
	"github.com/spitfireooo/keitaro-manager/internal/modules/campaign"
	"github.com/spitfireooo/keitaro-manager/internal/modules/keitaro"
	"github.com/spitfireooo/keitaro-manager/internal/modules/offer"
	"github.com/spitfireooo/keitaro-manager/internal/modules/stream"
)

type App struct {
	DB             *pgxpool.Pool
	httpAddr       string
	KeitaroModule  *keitaro.Module
	OfferModule    *offer.Module
	CampaignModule *campaign.Module
	StreamModule   *stream.Module
}

func New(ctx context.Context, cfg config.Config) (*App, error) {
	db, err := database.NewPostgres(ctx, database.DatabaseConfig{
		Host:     cfg.Database.Host,
		Port:     cfg.Database.Port,
		Username: cfg.Database.Username,
		Password: cfg.Database.Password,
		Database: cfg.Database.Database,
		SSLMode:  cfg.Database.SSLMode,
	})
	if err != nil {
		return nil, err
	}

	keitaroModule := keitaro.NewModule(cfg.Keitaro.BaseURL, cfg.Keitaro.APIKey)
	offerModule := offer.NewModule(keitaroModule.Client)
	campaignModule := campaign.NewModule(keitaroModule.Client, campaign.Defaults{
		DomainID:        cfg.Keitaro.DomainID,
		GroupID:         cfg.Keitaro.GroupID,
		TrafficSourceID: cfg.Keitaro.TrafficSourceID,
	})
	streamModule := stream.NewModule(db, keitaroModule.Client)

	return &App{
		DB:             db,
		httpAddr:       cfg.HTTPAddr,
		KeitaroModule:  keitaroModule,
		OfferModule:    offerModule,
		CampaignModule: campaignModule,
		StreamModule:   streamModule,
	}, nil
}

func (a *App) Close() {
	a.DB.Close()
}
