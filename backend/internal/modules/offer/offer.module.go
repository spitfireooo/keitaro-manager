package offer

import (
	"github.com/gofiber/fiber/v2"
	"github.com/spitfireooo/keitaro-manager/internal/modules/keitaro"
)

type Module struct {
	Service    *Service
	Controller *Controller
}

func NewModule(client *keitaro.Client) *Module {
	service := NewService(client)
	controller := NewController(service)

	return &Module{
		Service:    service,
		Controller: controller,
	}
}

func (m *Module) RegisterRoutes(router fiber.Router) {
	Routes(router, m.Controller)
}
