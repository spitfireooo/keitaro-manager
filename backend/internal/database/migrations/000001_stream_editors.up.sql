CREATE TABLE stream_editors (
    campaign_id BIGINT NOT NULL CHECK (campaign_id > 0),
    stream_id BIGINT NOT NULL CHECK (stream_id > 0),

    published_offers JSONB NOT NULL DEFAULT '[]'::jsonb
        CHECK (jsonb_typeof(published_offers) = 'array'),

    draft_offers JSONB
        CHECK (draft_offers IS NULL OR jsonb_typeof(draft_offers) = 'array'),

    removed_offers JSONB NOT NULL DEFAULT '[]'::jsonb
        CHECK (jsonb_typeof(removed_offers) = 'array'),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    PRIMARY KEY (campaign_id, stream_id)
);