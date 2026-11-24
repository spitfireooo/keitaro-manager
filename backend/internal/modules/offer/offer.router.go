package offer

import "github.com/gofiber/fiber/v2"

func Routes(router fiber.Router, controller *Controller) {
	offers := router.Group("/offers")
	offers.Get("/", controller.ListOffers)
}
