import { BASE_PATHS } from '../common/base.paths.js';

export const AUTH_PATHS = {
  forgotPassword: `${BASE_PATHS.auth}/forgot-password`,
  login: `${BASE_PATHS.auth}/login`,
  me: `${BASE_PATHS.auth}/me`,
  register: `${BASE_PATHS.auth}/register`,
  resendVerification: `${BASE_PATHS.auth}/resend-verification`,
  resetPassword: `${BASE_PATHS.auth}/reset-password`,
  verifyEmail: `${BASE_PATHS.auth}/verify-email`,
} as const;
