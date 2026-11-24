package config

import (
	"errors"
	"net"
	"strconv"
	"strings"
)

func (cfg Config) validate() error {
	_, port, err := net.SplitHostPort(cfg.HTTPAddr)
	if err != nil || !validPort(port) {
		return errors.New("HTTP_ADDR must be an address with a valid port, e.g. 127.0.0.1:8080")
	}

	if strings.TrimSpace(cfg.Database.Host) == "" {
		return errors.New("DB_HOST is required")
	}
	if !validPort(cfg.Database.Port) {
		return errors.New("DB_PORT must be between 1 and 65535")
	}
	if strings.TrimSpace(cfg.Database.Username) == "" {
		return errors.New("DB_USERNAME is required")
	}
	if cfg.Database.Password == "" {
		return errors.New("DB_PASSWORD is required")
	}
	if strings.TrimSpace(cfg.Database.Database) == "" {
		return errors.New("DB_NAME is required")
	}

	if cfg.Keitaro.DomainID <= 0 || cfg.Keitaro.GroupID <= 0 || cfg.Keitaro.TrafficSourceID <= 0 {
		return errors.New("KEITARO_DOMAIN_ID, KEITARO_GROUP_ID and KEITARO_TRAFFIC_SOURCE_ID must be positive integers")
	}

	switch cfg.Database.SSLMode {
	case "disable", "allow", "prefer", "require", "verify-ca", "verify-full":
		return nil
	default:
		return errors.New("DB_SSL_MODE must be disable, allow, prefer, require, verify-ca or verify-full")
	}
}

func validPort(value string) bool {
	port, err := strconv.ParseUint(value, 10, 16)
	return err == nil && port > 0
}
