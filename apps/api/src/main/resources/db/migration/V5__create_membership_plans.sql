CREATE TABLE membership_plans (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id         UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    name                VARCHAR(100) NOT NULL,
    description         TEXT,
    price               DECIMAL(12, 4) NOT NULL,
    duration_type       VARCHAR(10) NOT NULL
                        CHECK (duration_type IN ('DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM')),
    duration_value      INT NOT NULL DEFAULT 1,
    allowed_sessions    VARCHAR(10)[] DEFAULT ARRAY['MORNING', 'EVENING'],
    allowed_days        SMALLINT[] DEFAULT ARRAY[0,1,2,3,4,5,6],
    max_checkins_per_day INT DEFAULT 1,
    is_active           BOOLEAN DEFAULT TRUE,
    sort_order          INT DEFAULT 0,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_plans_location ON membership_plans(location_id);