package keitaro

type Module struct {
	Client *Client
}

func NewModule(baseURL, apiKey string) *Module {
	return &Module{
		Client: NewClient(baseURL, apiKey),
	}
}
