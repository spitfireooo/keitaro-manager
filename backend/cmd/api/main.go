package main

import (
	"context"
	"fmt"
	"log"

	"github.com/spitfireooo/keitaro-manager/internal/app"
	"github.com/spitfireooo/keitaro-manager/internal/config"
)

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}

func run() error {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("load config: %v", err)
	}

	rootApp, err := app.New(context.Background(), cfg)
	if err != nil {
		return fmt.Errorf("init app: %w", err)
	}
	defer rootApp.Close()

	return app.NewHTTPApp(rootApp).Run()
}
