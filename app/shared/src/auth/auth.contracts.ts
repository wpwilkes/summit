import { HTTP_METHOD } from '../common/http.js';
import { AUTH_PATHS } from './auth.paths.js';
import {
  AuthResponseSchema,
  LoginRequestSchema,
  MeRequestSchema,
  MeResponseSchema,
  RegisterRequestSchema,
} from './auth.schemas.js';

export const AUTH_CONTRACTS = {
  login: {
    method: HTTP_METHOD.post,
    path: AUTH_PATHS.login,
    requestBody: LoginRequestSchema,
    responseBody: AuthResponseSchema,
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
    responseBody: AuthResponseSchema,
  },
} as const;
