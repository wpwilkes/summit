const PING_BASE = "/api/ping";

export const PING_PATHS = {
    database: `${PING_BASE}/database`,
    server: `${PING_BASE}/server`,
} as const;
