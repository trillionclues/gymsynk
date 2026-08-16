CREATE TABLE payments (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membership_id  UUID NOT NULL REFERENCES memberships(id),
    user_id        UUID NOT NULL REFERENCES users(id),
    org_id         UUID NOT NULL REFERENCES organizations(id), -- denormalized
    amount         DECIMAL(12, 4) NOT NULL,
    currency       VARCHAR(3) NOT NULL DEFAULT 'NGN',
    payment_method VARCHAR(20) NOT NULL DEFAULT 'CASH',
                   -- CASH | CARD | TRANSFER | ONLINE
    payment_status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
                   -- PENDING | COMPLETED | FAILED | REFUNDED
    reference      VARCHAR(100),
    receipt_number VARCHAR(50) UNIQUE,
    external_ref   VARCHAR(255), -- gateway transaction ID (FULL_PROCESSING only)
    notes          TEXT,
    received_by    UUID REFERENCES users(id),
    created_at     TIMESTAMPTZ DEFAULT NOW()
    -- No receipt_file_path — receipts generated on-demand, streamed, never stored
);
CREATE INDEX idx_payments_membership ON payments(membership_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_date ON payments(created_at);
CREATE INDEX idx_payments_receipt ON payments(receipt_number);