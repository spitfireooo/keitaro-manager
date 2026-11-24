package stream

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

const selectEditorState = `
	SELECT published_offers, draft_offers, removed_offers
	FROM stream_editors
	WHERE campaign_id = $1 AND stream_id = $2
`

var errEditorStateNotFound = errors.New("editor state not found")

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db}
}

func (r *Repository) Get(
	ctx context.Context,
	campaignID, streamID int64,
) (EditorState, error) {
	row := r.db.QueryRow(ctx, selectEditorState, campaignID, streamID)
	return scanEditorState(row)
}

func (r *Repository) Update(
	ctx context.Context,
	campaignID, streamID int64,
	change func(state *EditorState) error,
) (EditorState, error) {
	var result EditorState

	err := pgx.BeginFunc(ctx, r.db, func(tx pgx.Tx) error {
		_, err := tx.Exec(ctx, `
			INSERT INTO stream_editors (campaign_id, stream_id)
			VALUES ($1, $2)
			ON CONFLICT (campaign_id, stream_id) DO NOTHING
		`, campaignID, streamID)
		if err != nil {
			return err
		}

		row := tx.QueryRow(ctx, selectEditorState+" FOR UPDATE", campaignID, streamID)
		state, err := scanEditorState(row)
		if err != nil {
			return err
		}

		if err := change(&state); err != nil {
			return err
		}

		if state.PublishedOffers == nil {
			state.PublishedOffers = []EditorOffer{}
		}
		if state.RemovedOffers == nil {
			state.RemovedOffers = []EditorOffer{}
		}

		var draft any
		if state.DraftOffers != nil {
			draft = state.DraftOffers
		}

		_, err = tx.Exec(ctx, `
			UPDATE stream_editors
			SET published_offers = $3::jsonb,
				draft_offers = $4::jsonb,
				removed_offers = $5::jsonb,
				updated_at = now()
			WHERE campaign_id = $1 AND stream_id = $2
		`, campaignID, streamID, state.PublishedOffers, draft, state.RemovedOffers)
		if err != nil {
			return err
		}

		result = state
		return nil
	})
	if err != nil {
		return EditorState{}, err
	}

	return result, nil
}

func (r *Repository) ClearDraft(ctx context.Context, campaignID, streamID int64) (EditorState, error) {
	row := r.db.QueryRow(ctx, `
		UPDATE stream_editors
		SET draft_offers = NULL, updated_at = now()
		WHERE campaign_id = $1 AND stream_id = $2
		RETURNING published_offers, draft_offers, removed_offers
	`, campaignID, streamID)

	state, err := scanEditorState(row)
	if errors.Is(err, pgx.ErrNoRows) {
		return EditorState{}, errEditorStateNotFound
	}

	return state, err
}

func scanEditorState(row pgx.Row) (EditorState, error) {
	var state EditorState
	err := row.Scan(&state.PublishedOffers, &state.DraftOffers, &state.RemovedOffers)

	return state, err
}
