CREATE TABLE check_ins (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    membership_id   UUID REFERENCES memberships(id),
    location_id     UUID NOT NULL REFERENCES locations(id),
    org_id          UUID NOT NULL REFERENCES organizations(id),
    session_type    VARCHAR(10) NOT NULL CHECK (session_type IN ('MORNING', 'EVENING')),
    check_in_method VARCHAR(20) NOT NULL DEFAULT 'QR_SCAN',
    status          VARCHAR(30) NOT NULL DEFAULT 'VALID',
    override_reason TEXT,
    check_in_time   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_checkins_user ON check_ins(user_id, check_in_time DESC);
CREATE INDEX idx_checkins_location ON check_ins(location_id, check_in_time DESC);
CREATE INDEX idx_checkins_session ON check_ins(location_id, session_type, check_in_time);
