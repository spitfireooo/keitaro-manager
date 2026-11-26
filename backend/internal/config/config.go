package config

import (
	"errors"
	"fmt"
	"os"
	"strings"

	"github.com/joho/godotenv"
	"github.com/spf13/viper"
	"github.com/spitfireooo/keitaro-manager/internal/database"
)

type Config struct {
	HTTPAddr string
	Database database.DatabaseConfig
	Keitaro  KeitaroConfig
}

type KeitaroConfig struct {
	BaseURL         string
	APIKey          string
	DomainID        int64
	GroupID         int64
	TrafficSourceID int64
}

func Load() (Config, error) {
	if err := godotenv.Load("../.env"); err != nil && !errors.Is(err, os.ErrNotExist) {
		return Config{}, fmt.Errorf("load ../.env: %w", err)
	}

	v := viper.New()
	v.SetConfigFile("configs/config.yaml")
	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	v.AutomaticEnv()

	if err := v.BindEnv("db.database", "DB_NAME", "DB_DATABASE"); err != nil {
		return Config{}, fmt.Errorf("bind database name: %w", err)
	}

	if err := v.ReadInConfig(); err != nil {
		return Config{}, fmt.Errorf("read configs/config.yaml: %w", err)
	}

	cfg := Config{
		HTTPAddr: v.GetString("http.addr"),
		Database: database.DatabaseConfig{
			Host:     v.GetString("db.host"),
			Port:     v.GetString("db.port"),
			Username: v.GetString("db.username"),
			Password: os.Getenv("DB_PASSWORD"),
			Database: v.GetString("db.database"),
			SSLMode:  v.GetString("db.ssl_mode"),
		},
		Keitaro: KeitaroConfig{
			BaseURL:         v.GetString("keitaro.base_url"),
			APIKey:          os.Getenv("KEITARO_API_KEY"),
			DomainID:        v.GetInt64("keitaro.domain_id"),
			GroupID:         v.GetInt64("keitaro.group_id"),
			TrafficSourceID: v.GetInt64("keitaro.traffic_source_id"),
		},
	}

	if err := cfg.validate(); err != nil {
		return Config{}, err
	}

	return cfg, nil
}
