CREATE TABLE operating_hours (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id  UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    day_of_week  INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    session_type VARCHAR(10) NOT NULL CHECK (session_type IN ('MORNING', 'EVENING')),
    open_time    TIME NOT NULL,
    close_time   TIME NOT NULL,
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (location_id, day_of_week, session_type)
);
CREATE INDEX idx_operating_hours_location ON operating_hours(location_id);
