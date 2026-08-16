CREATE TABLE organizations (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name             VARCHAR(255) NOT NULL,
    slug             VARCHAR(100) UNIQUE NOT NULL,
    -- No logo_url — logo is auto-generated avatar from name initials via DiceBear
    default_currency  VARCHAR(3) DEFAULT 'NGN',
    timezone         VARCHAR(50) DEFAULT 'Africa/Lagos',
    payment_mode     VARCHAR(20) NOT NULL DEFAULT 'CASH_ONLY',
                     -- CASH_ONLY | TRACK_AND_RECEIPT | FULL_PROCESSING
    setup_complete   BOOLEAN DEFAULT FALSE,
    settings         JSONB DEFAULT '{}',
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW()
);