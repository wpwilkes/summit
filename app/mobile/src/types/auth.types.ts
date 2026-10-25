import type {
  LoginRequest as SharedLoginRequest,
  RegisterRequest,
} from '@summit/shared';

/*
 * Login and registration request types come
 * from the shared API contract.
 */
export type LoginRequest = SharedLoginRequest;
export type SignupRequest = RegisterRequest;

/*
 * These types remain local for now because
 * their real backend contracts are not yet
 * available in shared.
 */
export type VerifyEmailRequest = {
  email: string;
  code: string;
};

export type ResendVerificationRequest = {
  email: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  email: string;
  code: string;
  newPassword: string;
};

/*
 * These are UI/service result types.
 * They are different from the raw backend response.
 */
export type AuthResponse = {
  success: boolean;
  message: string;
};

export type LoginResponse = {
  success: boolean;
  message: string;
  token?: string;
};