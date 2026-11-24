package stream

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/spitfireooo/keitaro-manager/internal/modules/keitaro"
)

type Module struct {
	Repository *Repository
	Service    *Service
	Controller *Controller
}

func NewModule(db *pgxpool.Pool, client *keitaro.Client) *Module {
	repository := NewRepository(db)
	service := NewService(repository, client)
	controller := NewController(service)

	return &Module{
		Repository: repository,
		Service:    service,
		Controller: controller,
	}
}

func (m *Module) RegisterRoutes(router fiber.Router) {
	Routes(router, m.Controller)
}
