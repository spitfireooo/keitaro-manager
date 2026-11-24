package campaign

import "github.com/gofiber/fiber/v2"

func Routes(router fiber.Router, controller *Controller) {
	campaigns := router.Group("/campaigns")
	campaigns.Post("/", controller.Create)
	campaigns.Get("/", controller.List)
	campaigns.Get(":campaignID/streams", controller.ListStreams)
}
