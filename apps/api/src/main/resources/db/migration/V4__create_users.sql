CREATE TABLE users (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id                  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email                   VARCHAR(255),
    phone                   VARCHAR(20),
    password_hash           VARCHAR(255),
    first_name              VARCHAR(100) NOT NULL,
    last_name               VARCHAR(100) NOT NULL,
    date_of_birth           DATE,
    gender                  VARCHAR(10),
    -- No photo_url column — avatars are generated client-side from name initials via DiceBear
    role                    VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
                            -- ADMIN | CASHIER | MEMBER
    member_number           VARCHAR(10) UNIQUE,  -- GS-XXXXX, only for MEMBER role
    is_active               BOOLEAN DEFAULT TRUE,
    emergency_contact_name  VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    notes                   TEXT,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, email),
    UNIQUE(org_id, phone)
);
CREATE INDEX idx_users_org_role ON users(org_id, role);
CREATE INDEX idx_users_name ON users(org_id, last_name, first_name);
CREATE INDEX idx_users_member_number ON users(member_number);