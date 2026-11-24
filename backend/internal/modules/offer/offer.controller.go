package offer

import (
	"errors"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/spitfireooo/keitaro-manager/internal/modules/keitaro"
)

type Controller struct {
	service *Service
}

func NewController(service *Service) *Controller {
	return &Controller{service}
}

func (c *Controller) ListOffers(ctx *fiber.Ctx) error {
	offers, err := c.service.ListOffers(ctx.UserContext())
	if errors.Is(err, keitaro.ErrAPIKeyMissing) {
		return ctx.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"code": "keitaro_not_configured",
		})
	}
	if err != nil {
		log.Printf("list Keitaro offers: %v", err)
		return ctx.Status(fiber.StatusBadGateway).JSON(fiber.Map{
			"code": "keitaro_request_failed",
		})
	}

	return ctx.Status(fiber.StatusOK).JSON(offers)
}
