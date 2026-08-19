CREATE TABLE payments (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membership_id  UUID NOT NULL REFERENCES memberships(id),
    user_id        UUID NOT NULL REFERENCES users(id),
    org_id         UUID NOT NULL REFERENCES organizations(id),
    amount         DECIMAL(12, 4) NOT NULL,
    currency       VARCHAR(3) NOT NULL DEFAULT 'NGN',
    payment_method VARCHAR(20) NOT NULL DEFAULT 'CASH',
    payment_status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
    external_ref   VARCHAR(255),
    received_by    UUID REFERENCES users(id),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_payments_membership ON payments(membership_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_date ON payments(created_at);
