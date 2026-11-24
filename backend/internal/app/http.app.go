package app

import (
	"context"
	"time"

	"github.com/gofiber/fiber/v2"
)

type HTTPApp struct {
	Fiber *fiber.App
	Addr  string
}

func NewHTTPApp(rootApp *App) *HTTPApp {
	server := fiber.New(fiber.Config{
		AppName: "Keitaro Manager",
	})

	api := server.Group("/api")

	rootApp.OfferModule.RegisterRoutes(api)
	rootApp.CampaignModule.RegisterRoutes(api)
	rootApp.StreamModule.RegisterRoutes(api)

	api.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	api.Get("/ready", func(c *fiber.Ctx) error {
		ctx, cancel := context.WithTimeout(c.UserContext(), 2*time.Second)
		defer cancel()

		if err := rootApp.DB.Ping(ctx); err != nil {
			return c.Status(fiber.StatusServiceUnavailable).
				JSON(fiber.Map{"status": "database_unavailable"})
		}

		return c.JSON(fiber.Map{"status": "ready"})
	})

	return &HTTPApp{
		Fiber: server,
		Addr:  rootApp.httpAddr,
	}
}

func (a *HTTPApp) Run() error {
	return a.Fiber.Listen(a.Addr)
}
