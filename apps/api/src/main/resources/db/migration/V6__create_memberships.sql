CREATE TABLE memberships (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id     UUID NOT NULL REFERENCES membership_plans(id),
    location_id UUID NOT NULL REFERENCES locations(id),
    org_id      UUID NOT NULL REFERENCES organizations(id),
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_memberships_user ON memberships(user_id);
CREATE INDEX idx_memberships_status ON memberships(status, end_date);
CREATE INDEX idx_memberships_expiry ON memberships(end_date) WHERE status = 'ACTIVE';
CREATE INDEX idx_memberships_location ON memberships(location_id);
