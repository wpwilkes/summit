import { AppError } from '../errors/app.error.js';
import { ErrorCode } from '../errors/error-code.js';
import { HttpStatus } from '../errors/http-status.js';
import type { BodyRequest } from '../types/requests.js';
import { getMe, loginService, registerService } from './auth.services.js';
import {
  AUTH_CONTRACTS,
  type LoginRequest,
  type LoginResponse,
  type MeRequest,
  type MeResponse,
  type RegisterRequest,
  type RegisterResponse,
} from '@summit/shared';
import type { Response } from 'express';

export async function loginController(
  request: BodyRequest<LoginRequest>,
  response: Response<LoginResponse>,
): Promise<void> {
  const parsed = AUTH_CONTRACTS.login.requestBody.safeParse(request.body);
  if (!parsed.success) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.INVALID_REQUEST,
      'Invalid login request.',
    );
  }
  const result = await loginService(parsed.data);
  response.status(HttpStatus.OK).json(result);
}

export async function meController(
  request: BodyRequest<MeRequest>,
  response: Response<MeResponse>,
): Promise<void> {
  const result = await getMe(request.userId!);
  response.status(HttpStatus.OK).json(result);
}

export async function registerController(
  request: BodyRequest<RegisterRequest>,
  response: Response<RegisterResponse>,
): Promise<void> {
  const parsed = AUTH_CONTRACTS.register.requestBody.safeParse(request.body);
  if (!parsed.success) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.INVALID_REQUEST,
      'Invalid registration request.',
    );
  }
  const result = await registerService(parsed.data);
  response.status(HttpStatus.CREATED).json(result);
}
