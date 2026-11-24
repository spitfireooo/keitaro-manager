package stream

import "github.com/gofiber/fiber/v2"

func Routes(router fiber.Router, controller *Controller) {
	streams := router.Group("/campaigns/:campaignID/streams")
	streams.Post("/:streamID/offers", controller.AddOffer)
	streams.Delete("/:streamID/offers/:offerID", controller.RemoveOffer)
	streams.Delete("/:streamID/draft", controller.Cancel)
	streams.Post("/:streamID/fetch", controller.Fetch)
	streams.Post("/:streamID/publish", controller.Publish)
}
