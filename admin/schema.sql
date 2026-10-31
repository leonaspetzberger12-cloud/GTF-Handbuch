CREATE TABLE IF NOT EXISTS admin_sessions (
 token TEXT PRIMARY KEY,
 expires INTEGER NOT NULL,
 pin_version TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS admin_attempts (
 key TEXT NOT NULL,
 bucket INTEGER NOT NULL,
 count INTEGER NOT NULL,
 PRIMARY KEY(key,bucket)
);
