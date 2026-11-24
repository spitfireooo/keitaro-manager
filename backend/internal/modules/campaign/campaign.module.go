package campaign

import (
	"github.com/gofiber/fiber/v2"
	"github.com/spitfireooo/keitaro-manager/internal/modules/keitaro"
)

type Module struct {
	Service    *Service
	Controller *Controller
}

func NewModule(client *keitaro.Client, defaults Defaults) *Module {
	service := NewService(client, defaults)

	return &Module{
		Service:    service,
		Controller: NewController(service),
	}
}

func (m *Module) RegisterRoutes(router fiber.Router) {
	Routes(router, m.Controller)
}
