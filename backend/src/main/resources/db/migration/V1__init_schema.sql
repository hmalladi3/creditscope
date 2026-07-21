CREATE TABLE company (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    ticker      VARCHAR(10) NOT NULL,
    sector      VARCHAR(100) NOT NULL,
    country     VARCHAR(100) NOT NULL,
    description TEXT,
    CONSTRAINT uq_company_ticker UNIQUE (ticker)
);

CREATE TABLE rating (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id   UUID NOT NULL REFERENCES company (id) ON DELETE CASCADE,
    grade        VARCHAR(5) NOT NULL,
    outlook      VARCHAR(10) NOT NULL,
    rating_date  DATE NOT NULL,
    rationale    TEXT
);

CREATE INDEX idx_rating_company_id ON rating (company_id);
CREATE INDEX idx_rating_company_date ON rating (company_id, rating_date DESC, id DESC);

CREATE TABLE app_user (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username      VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20) NOT NULL,
    CONSTRAINT uq_app_user_username UNIQUE (username)
);
