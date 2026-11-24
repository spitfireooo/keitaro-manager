package keitaro

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

var ErrAPIKeyMissing = errors.New("KEITARO_API_KEY is required")

type APIError struct {
	Method     string
	Path       string
	StatusCode int
}

func (e *APIError) Error() string {
	return fmt.Sprintf("Keitaro %s %s returned HTTP %d", e.Method, e.Path, e.StatusCode)
}

type Client struct {
	baseURL    string
	apiKey     string
	httpClient *http.Client
}

type Offer struct {
	ID    int64  `json:"id"`
	Name  string `json:"name"`
	State string `json:"state"`
}

func NewClient(baseURL, apiKey string) *Client {
	return &Client{
		baseURL: strings.TrimRight(baseURL, "/"),
		apiKey:  apiKey,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
			CheckRedirect: func(_ *http.Request, _ []*http.Request) error {
				return http.ErrUseLastResponse
			},
		},
	}
}

func (c *Client) ListOffers(ctx context.Context) ([]Offer, error) {
	var offers []Offer
	err := c.doJSON(ctx, http.MethodGet, "/offers", nil, &offers)

	return offers, err
}

func (c *Client) GetOffer(ctx context.Context, id int64) (Offer, error) {
	var offer Offer
	err := c.doJSON(ctx, http.MethodGet, fmt.Sprintf("/offers/%d", id), nil, &offer)

	return offer, err
}

func (c *Client) doJSON(ctx context.Context, method, path string, input, output any) error {
	if c.apiKey == "" {
		return ErrAPIKeyMissing
	}

	var body io.Reader
	if input != nil {
		data, err := json.Marshal(input)
		if err != nil {
			return fmt.Errorf("encode Keitaro %s %s request: %w", method, path, err)
		}

		body = bytes.NewReader(data)
	}

	req, err := http.NewRequestWithContext(ctx, method, c.baseURL+path, body)
	if err != nil {
		return fmt.Errorf("build Keitaro %s %s request: %w", method, path, err)
	}

	req.Header.Set("Api-Key", c.apiKey)
	req.Header.Set("Accept", "application/json")
	if input != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	res, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("request Keitaro %s %s: %w", method, path, err)
	}
	defer res.Body.Close()

	if res.StatusCode < http.StatusOK || res.StatusCode >= http.StatusMultipleChoices {
		return &APIError{Method: method, Path: path, StatusCode: res.StatusCode}
	}

	if output == nil {
		return nil
	}

	if err := json.NewDecoder(res.Body).Decode(output); err != nil {
		return fmt.Errorf("decode Keitaro %s %s response: %w", method, path, err)
	}

	return nil
}
