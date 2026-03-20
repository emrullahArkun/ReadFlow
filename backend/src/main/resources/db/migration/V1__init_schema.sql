CREATE TABLE IF NOT EXISTS users (
    id          BIGSERIAL PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(50),
    enabled     BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS books (
    id                  BIGSERIAL PRIMARY KEY,
    isbn                VARCHAR(255),
    title               VARCHAR(255),
    author              VARCHAR(255),
    publish_date        VARCHAR(255),
    cover_url           VARCHAR(255),
    page_count          INTEGER,
    current_page        INTEGER,
    start_date          DATE,
    completed           BOOLEAN,
    reading_goal_type   VARCHAR(50),
    reading_goal_pages  INTEGER,
    categories          VARCHAR(500),
    user_id             BIGINT NOT NULL REFERENCES users(id),
    UNIQUE (user_id, isbn)
);

CREATE INDEX IF NOT EXISTS idx_book_user ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_book_isbn ON books(isbn);

CREATE TABLE IF NOT EXISTS reading_session (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id),
    book_id         BIGINT NOT NULL REFERENCES books(id),
    start_time      TIMESTAMPTZ NOT NULL,
    end_time        TIMESTAMPTZ,
    status          VARCHAR(50) NOT NULL,
    start_page      INTEGER,
    end_page        INTEGER,
    pages_read      INTEGER,
    paused_millis   BIGINT DEFAULT 0,
    paused_at       TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_session_user ON reading_session(user_id);
CREATE INDEX IF NOT EXISTS idx_session_book ON reading_session(book_id);
CREATE INDEX IF NOT EXISTS idx_session_user_status ON reading_session(user_id, status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_session_per_user
    ON reading_session(user_id)
    WHERE status IN ('ACTIVE', 'PAUSED');

CREATE TABLE IF NOT EXISTS search_history (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id),
    query       VARCHAR(255),
    timestamp   TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_search_user_ts ON search_history(user_id, timestamp);
