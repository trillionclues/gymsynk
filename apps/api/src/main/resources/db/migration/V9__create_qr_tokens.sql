CREATE TABLE qr_tokens (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id),
    token      VARCHAR(64) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used       BOOLEAN DEFAULT FALSE,
    used_at    TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
    -- Primary store is Redis (TTL-based). This table is audit trail only.
);
CREATE INDEX idx_qr_tokens_token ON qr_tokens(token) WHERE used = FALSE;
CREATE INDEX idx_qr_tokens_expiry ON qr_tokens(expires_at);