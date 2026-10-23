import { AppError } from '../errors/app.error.js';
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
    throw new AppError(400, 'INVALID_REQUEST', 'Invalid login request.');
  }
  const serviceResult = await loginService(parsed.data);
  const result = AUTH_CONTRACTS.login.responseBody.parse(serviceResult);
  response.status(200).json(result);
}

export async function meController(
  request: BodyRequest<MeRequest>,
  response: Response<MeResponse>,
): Promise<void> {
  if (request.userId === undefined) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
  }
  const serviceResult = await getMe(request.userId);
  const result = AUTH_CONTRACTS.me.responseBody.parse(serviceResult);
  response.status(200).json(result);
}

export async function registerController(
  request: BodyRequest<RegisterRequest>,
  response: Response<RegisterResponse>,
): Promise<void> {
  const parsed = AUTH_CONTRACTS.register.requestBody.safeParse(request.body);
  if (!parsed.success) {
    throw new AppError(400, 'INVALID_REQUEST', 'Invalid registration request.');
  }
  const serviceResult = await registerService(parsed.data);
  const result = AUTH_CONTRACTS.register.responseBody.parse(serviceResult);
  response.status(201).json(result);
}
