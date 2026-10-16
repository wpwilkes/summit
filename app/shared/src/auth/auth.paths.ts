const AUTH_BASE = "/api/auth";

export const AUTH_PATHS = {
  login: `${AUTH_BASE}/login`,
  register: `${AUTH_BASE}/register`,
} as const;
