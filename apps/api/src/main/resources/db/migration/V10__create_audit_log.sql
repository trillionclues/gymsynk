CREATE TABLE audit_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id      UUID NOT NULL REFERENCES organizations(id),
    actor_id    UUID REFERENCES users(id),
    action      VARCHAR(50) NOT NULL,
                -- MEMBER_CREATED | PAYMENT_RECORDED | CHECK_IN | CHECK_IN_OVERRIDE
                -- | PLAN_MODIFIED | MEMBERSHIP_RENEWED | MEMBER_UPDATED | STAFF_DEACTIVATED | etc.
                -- OVERRIDE check-ins get their own CHECK_IN_OVERRIDE action so they are
                -- independently filterable in the audit log UI without scanning check_in status.
    entity_type VARCHAR(50) NOT NULL,
    entity_id   UUID,
    old_value   JSONB,
    new_value   JSONB,
    ip_address  INET,
    created_at  TIMESTAMPTZ DEFAULT NOW()
    -- Append-only. Never updated or deleted. Consider monthly partitioning for high volume.
);
CREATE INDEX idx_audit_org ON audit_log(org_id, created_at DESC);
CREATE INDEX idx_audit_actor ON audit_log(actor_id, created_at DESC);