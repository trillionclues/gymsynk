CREATE TABLE check_ins (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    membership_id   UUID REFERENCES memberships(id),
    location_id     UUID NOT NULL REFERENCES locations(id),
    org_id          UUID NOT NULL REFERENCES organizations(id), -- denormalized
    session_type    VARCHAR(10) NOT NULL CHECK (session_type IN ('MORNING', 'EVENING')),
    check_in_time   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    check_in_method VARCHAR(20) NOT NULL DEFAULT 'QR_SCAN',
                    -- QR_SCAN | MANUAL
    verified_by     UUID REFERENCES users(id), -- cashier who verified; NULL for self-QR
    status          VARCHAR(20) NOT NULL DEFAULT 'VALID',
                    -- VALID | EXPIRED_PLAN | WRONG_SESSION | WRONG_DAY | ALREADY_CHECKED_IN | OVERRIDE
    override_by     UUID REFERENCES users(id),
    override_reason TEXT,
    synced          BOOLEAN DEFAULT TRUE, -- FALSE for offline check-ins pending sync
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_checkins_user ON check_ins(user_id, check_in_time DESC);
CREATE INDEX idx_checkins_location ON check_ins(location_id, check_in_time DESC);
CREATE INDEX idx_checkins_date ON check_ins(check_in_time);
CREATE INDEX idx_checkins_session ON check_ins(location_id, session_type, check_in_time);
CREATE INDEX idx_checkins_unsynced ON check_ins(synced) WHERE synced = FALSE;
-- Partitioning by range on check_in_time is documented for high-volume deployments (optional)