import { BASE_PATHS } from '../common/base.paths.js';

export const AUTH_PATHS = {
  login: `${BASE_PATHS.auth}/login`,
  me: `${BASE_PATHS.auth}/me`,
  register: `${BASE_PATHS.auth}/register`,

  forgotPassword: `${BASE_PATHS.auth}/forgot-password`,
  resetPassword: `${BASE_PATHS.auth}/reset-password`,
} as const;
