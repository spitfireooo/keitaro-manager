package stream

import (
	"errors"
	"log"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/spitfireooo/keitaro-manager/internal/modules/keitaro"
)

var errInvalidStreamIDs = errors.New("campaign and stream IDs must be positive integers")

type Controller struct {
	service *Service
}

func NewController(service *Service) *Controller {
	return &Controller{service: service}
}

func (c *Controller) AddOffer(ctx *fiber.Ctx) error {
	campaignID, streamID, err := parseStreamIDs(ctx)
	if err != nil {
		return streamErrorResponse(ctx, streamID, err)
	}

	var input struct {
		OfferID int64 `json:"offer_id"`
	}
	if err := ctx.BodyParser(&input); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"code": "invalid_body",
		})
	}

	state, err := c.service.AddOffer(ctx.UserContext(), campaignID, streamID, input.OfferID)
	if err != nil {
		return streamErrorResponse(ctx, streamID, err)
	}

	return ctx.JSON(state)
}

func (c *Controller) Fetch(ctx *fiber.Ctx) error {
	campaignID, streamID, err := parseStreamIDs(ctx)
	if err != nil {
		return streamErrorResponse(ctx, streamID, err)
	}

	state, err := c.service.Fetch(ctx.UserContext(), campaignID, streamID)
	if err != nil {
		return streamErrorResponse(ctx, streamID, err)
	}

	return ctx.JSON(state)
}

func (c *Controller) Publish(ctx *fiber.Ctx) error {
	campaignID, streamID, err := parseStreamIDs(ctx)
	if err != nil {
		return streamErrorResponse(ctx, streamID, err)
	}

	state, err := c.service.Publish(ctx.UserContext(), campaignID, streamID)
	if err != nil {
		return streamErrorResponse(ctx, streamID, err)
	}

	return ctx.JSON(state)
}

func (c *Controller) RemoveOffer(ctx *fiber.Ctx) error {
	campaignID, streamID, err := parseStreamIDs(ctx)
	if err != nil {
		return streamErrorResponse(ctx, streamID, err)
	}

	offerID, err := strconv.ParseInt(ctx.Params("offerID"), 10, 64)
	if err != nil {
		return streamErrorResponse(ctx, streamID, errInvalidOfferID)
	}

	state, err := c.service.RemoveOffer(ctx.UserContext(), campaignID, streamID, offerID)
	if err != nil {
		return streamErrorResponse(ctx, streamID, err)
	}

	return ctx.JSON(state)
}

func (c *Controller) Cancel(ctx *fiber.Ctx) error {
	campaignID, streamID, err := parseStreamIDs(ctx)
	if err != nil {
		return streamErrorResponse(ctx, streamID, err)
	}

	state, err := c.service.Cancel(ctx.UserContext(), campaignID, streamID)
	if err != nil {
		return streamErrorResponse(ctx, streamID, err)
	}

	return ctx.JSON(state)
}

func parseStreamIDs(ctx *fiber.Ctx) (int64, int64, error) {
	campaignID, campaignErr := strconv.ParseInt(ctx.Params("campaignID"), 10, 64)
	streamID, streamErr := strconv.ParseInt(ctx.Params("streamID"), 10, 64)
	if campaignErr != nil || streamErr != nil || campaignID <= 0 || streamID <= 0 {
		return 0, 0, errInvalidStreamIDs
	}

	return campaignID, streamID, nil
}

func streamErrorResponse(ctx *fiber.Ctx, streamID int64, err error) error {
	switch {
	case errors.Is(err, errInvalidStreamIDs):
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"code": "invalid_campaign_or_stream_id",
		})
	case errors.Is(err, errEditorStateNotFound):
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"code": "editor_state_not_found",
		})
	case errors.Is(err, errOfferNotInStream):
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"code": "offer_not_in_stream",
		})
	case errors.Is(err, errStreamNotFound):
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"code": "stream_not_found",
		})
	case errors.Is(err, errStreamNotEditable):
		return ctx.Status(fiber.StatusConflict).JSON(fiber.Map{
			"code": "stream_not_editable",
		})
	case errors.Is(err, keitaro.ErrAPIKeyMissing):
		return ctx.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"code": "keitaro_not_configured",
		})
	case errors.Is(err, errKeitaroFetch), errors.Is(err, errKeitaroPublish):
		log.Printf("Keitaro request for stream %d: %v", streamID, err)
		return ctx.Status(fiber.StatusBadGateway).JSON(fiber.Map{
			"code": "keitaro_request_failed",
		})
	case errors.Is(err, errInvalidOfferID):
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"code": "invalid_offer_id",
		})
	case errors.Is(err, errOfferUnavailable):
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"code": "offer_unavailable",
		})
	case errors.Is(err, errOfferAlreadyAdded):
		return ctx.Status(fiber.StatusConflict).JSON(fiber.Map{
			"code": "offer_already_added",
		})
	case errors.Is(err, errShareDistribution):
		return ctx.Status(fiber.StatusConflict).JSON(fiber.Map{
			"code": "invalid_share_distribution",
		})
	case errors.Is(err, errStreamChanged):
		return ctx.Status(fiber.StatusConflict).JSON(fiber.Map{
			"code": "stream_changed_in_keitaro",
		})
	case errors.Is(err, errPublishUnconfirmed):
		return ctx.Status(fiber.StatusBadGateway).JSON(fiber.Map{
			"code": "publish_unconfirmed",
		})
	default:
		log.Printf("save editor state for stream %d: %v", streamID, err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"code": "internal_server_error",
		})
	}
}
