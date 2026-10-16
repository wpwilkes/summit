import { HTTP_METHOD } from "../common/http.js";
import { AUTH_PATHS } from "./auth.paths.js";
import {
  LoginRequestSchema,
  LoginResponseSchema,
  RegisterRequestSchema,
  RegisterResponseSchema,
} from "./auth.schemas.js";

export const AUTH_CONTRACTS = {
  login: {
    method: HTTP_METHOD.post,
    path: AUTH_PATHS.login,
    requestBody: LoginRequestSchema,
    responseBody: LoginResponseSchema,
  },
  register: {
    method: HTTP_METHOD.post,
    path: AUTH_PATHS.register,
    requestBody: RegisterRequestSchema,
    responseBody: RegisterResponseSchema,
  },
} as const;
