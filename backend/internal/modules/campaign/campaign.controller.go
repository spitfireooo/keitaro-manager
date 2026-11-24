package campaign

import (
	"errors"
	"log"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/spitfireooo/keitaro-manager/internal/modules/keitaro"
)

type Controller struct {
	service *Service
}

func NewController(service *Service) *Controller {
	return &Controller{service: service}
}

func (c *Controller) Create(ctx *fiber.Ctx) error {
	var input CreateInput
	if err := ctx.BodyParser(&input); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"code":    "invalid_body",
			"message": "Expected name, country_code and offer_id",
		})
	}

	result, err := c.service.Create(ctx.UserContext(), input)
	if err != nil {
		return createErrorResponse(ctx, err)
	}

	return ctx.Status(fiber.StatusCreated).JSON(result)
}

func (c *Controller) List(ctx *fiber.Ctx) error {
	offset, offsetErr := strconv.Atoi(ctx.Query("offset", "0"))
	limit, limitErr := strconv.Atoi(ctx.Query("limit", "50"))

	if offsetErr != nil || limitErr != nil || offset < 0 || limit < 1 {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"code":    "invalid_pagination",
			"message": "offset must be non-negative and limit must be positive",
		})
	}

	campaigns, err := c.service.List(ctx.UserContext(), offset, limit)
	if errors.Is(err, keitaro.ErrAPIKeyMissing) {
		return ctx.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"code": "keitaro_not_configured",
		})
	}
	if err != nil {
		log.Printf("list Keitaro campaigns: %v", err)
		return ctx.Status(fiber.StatusBadGateway).JSON(fiber.Map{
			"code": "keitaro_request_failed",
		})
	}

	return ctx.JSON(campaigns)
}

func (c *Controller) ListStreams(ctx *fiber.Ctx) error {
	campaignID, err := strconv.ParseInt(ctx.Params("campaignID"), 10, 64)
	if err != nil || campaignID <= 0 {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"code": "invalid_campaign_id",
		})
	}

	streams, err := c.service.ListStreams(ctx.UserContext(), campaignID)
	switch {
	case err == nil:
		return ctx.JSON(streams)
	case errors.Is(err, keitaro.ErrAPIKeyMissing):
		return ctx.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"code": "keitaro_not_configured",
		})
	case hasStatus(err, fiber.StatusNotFound):
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"code": "campaign_not_found",
		})
	default:
		log.Printf("list Keitaro streams for campaign %d: %v", campaignID, err)
		return ctx.Status(fiber.StatusBadGateway).JSON(fiber.Map{
			"code": "keitaro_request_failed",
		})
	}
}

func createErrorResponse(ctx *fiber.Ctx, err error) error {
	switch {
	case errors.Is(err, errNameRequired),
		errors.Is(err, errInvalidCountry),
		errors.Is(err, errInvalidOfferID),
		errors.Is(err, errOfferNotFound),
		errors.Is(err, errOfferDeleted):
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"code":    "invalid_campaign",
			"message": err.Error(),
		})
	case errors.Is(err, keitaro.ErrAPIKeyMissing):
		return ctx.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"code": "keitaro_not_configured",
		})
	}

	log.Printf("create campaign: %v", err)

	var incomplete *incompleteCreationError
	if errors.As(err, &incomplete) {
		response := fiber.Map{
			"code":  "campaign_creation_unconfirmed",
			"alias": incomplete.alias,
		}
		if incomplete.id > 0 {
			response["campaign_id"] = incomplete.id
		}

		return ctx.Status(fiber.StatusBadGateway).JSON(response)
	}

	return ctx.Status(fiber.StatusBadGateway).JSON(fiber.Map{
		"code": "keitaro_request_failed",
	})
}
