CREATE TYPE user_role AS ENUM ('admin', 'member');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    grad_year INT NOT NULL,
    role user_role NOT NULL DEFAULT 'member',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    code CHAR(10) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL
        REFERENCES courses(id)
        ON DELETE CASCADE,
    year INT NOT NULL,
    term CHAR(8) NOT NULL, -- fall, spring, summer-a, etc.
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE user_group_role AS ENUM ('owner', 'member');

CREATE TABLE user_groups (
    user_id INT NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,
    group_id INT NOT NULL
        REFERENCES groups(id)
        ON DELETE CASCADE,
    group_role user_group_role NOT NULL DEFAULT 'member',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, group_id)
);

CREATE TABLE user_events (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE group_notification_scope AS ENUM ('owner', 'all');

CREATE TABLE group_events (
    id SERIAL PRIMARY KEY,
    group_id INT NOT NULL
        REFERENCES groups(id)
        ON DELETE CASCADE,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    notification_scope group_notification_scope NOT NULL DEFAULT 'all',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
