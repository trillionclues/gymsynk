CREATE TABLE membership_plans (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id               UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name                 VARCHAR(100) NOT NULL,
    description          TEXT,
    price                DECIMAL(12, 4) NOT NULL DEFAULT 0,
    currency             VARCHAR(3) NOT NULL DEFAULT 'NGN',
    duration_type        VARCHAR(10) NOT NULL
                         CHECK (duration_type IN ('DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM')),
    duration_value       INT NOT NULL DEFAULT 1,
    -- Comma-separated strings: 'MORNING,EVENING' or 'MORNING'
    allowed_sessions     VARCHAR(50) NOT NULL DEFAULT 'MORNING,EVENING',
    -- Comma-separated day-of-week ints: '0,1,2,3,4,5,6'
    allowed_days         VARCHAR(20) NOT NULL DEFAULT '0,1,2,3,4,5,6',
    max_checkins_per_day INT NOT NULL DEFAULT 1,
    is_active            BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order           INT NOT NULL DEFAULT 0,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_plans_org ON membership_plans(org_id);
