import { HTTP_METHOD } from '../common/http.js';
import { AUTH_PATHS } from './auth.paths.js';
import {
  ForgotPasswordRequestSchema,
  ForgotPasswordResponseSchema,
  LoginRequestSchema,
  LoginResponseSchema,
  MeRequestSchema,
  MeResponseSchema,
  RegisterRequestSchema,
  RegisterResponseSchema,
  ResendVerificationRequestSchema,
  ResendVerificationResponseSchema,
  ResetPasswordRequestSchema,
  ResetPasswordResponseSchema,
  VerifyEmailRequestSchema,
  VerifyEmailResponseSchema,
} from './auth.schemas.js';

export const AUTH_CONTRACTS = {
  forgotPassword: {
    method: HTTP_METHOD.post,
    path: AUTH_PATHS.forgotPassword,
    requestBody: ForgotPasswordRequestSchema,
    responseBody: ForgotPasswordResponseSchema,
  },
  login: {
    method: HTTP_METHOD.post,
    path: AUTH_PATHS.login,
    requestBody: LoginRequestSchema,
    responseBody: LoginResponseSchema,
  },
  me: {
    method: HTTP_METHOD.get,
    path: AUTH_PATHS.me,
    requestBody: MeRequestSchema,
    responseBody: MeResponseSchema,
  },
  register: {
    method: HTTP_METHOD.post,
    path: AUTH_PATHS.register,
    requestBody: RegisterRequestSchema,
    responseBody: RegisterResponseSchema,
  },
  resendVerification: {
    method: HTTP_METHOD.post,
    path: AUTH_PATHS.resendVerification,
    requestBody: ResendVerificationRequestSchema,
    responseBody: ResendVerificationResponseSchema,
  },
  resetPassword: {
    method: HTTP_METHOD.post,
    path: AUTH_PATHS.resetPassword,
    requestBody: ResetPasswordRequestSchema,
    responseBody: ResetPasswordResponseSchema,
  },
  verifyEmail: {
    method: HTTP_METHOD.get,
    path: AUTH_PATHS.verifyEmail,
    requestBody: VerifyEmailRequestSchema,
    responseBody: VerifyEmailResponseSchema,
  },
} as const;
