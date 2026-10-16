import { getMe, loginService, registerService } from './auth.service.js';
import {
  AUTH_CONTRACTS,
  type LoginRequest,
  type LoginResponse,
  type MeRequest,
  type MeResponse,
  type RegisterRequest,
  type RegisterResponse,
} from '@summit/shared';
import type { Request, Response } from 'express';

type BodyRequest<T> = Request<Record<string, never>, unknown, T>;

type ErrorResponse = {
  error: string;
};

export async function loginController(
  request: BodyRequest<LoginRequest>,
  response: Response<LoginResponse | ErrorResponse>,
): Promise<void> {
  const parsed = AUTH_CONTRACTS.login.requestBody.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({
      error: 'Invalid login request. Failed to parse.',
    });
    return;
  }
  try {
    const serviceResult = await loginService(parsed.data);
    const result = AUTH_CONTRACTS.login.responseBody.parse(serviceResult);
    response.status(200).json(result);
  } catch (error) {
    console.error(error);
    response.status(500).json({
      error: 'Login error: service failed.',
    });
  }
}

export async function meController(
  req: BodyRequest<MeRequest>,
  res: Response<MeResponse | ErrorResponse>,
): Promise<void> {
  try {
    if (req.userId == undefined) {
      res.status(401).json({
        error: 'Unauthorized',
      });
      return;
    }

    const serviceResult = await getMe(req.userId);
    const result = AUTH_CONTRACTS.me.responseBody.parse(serviceResult);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
}

export async function registerController(
  request: BodyRequest<RegisterRequest>,
  response: Response<RegisterResponse | ErrorResponse>,
): Promise<void> {
  const parsed = AUTH_CONTRACTS.register.requestBody.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({
      error: 'Invalid registration request. Failed to parse.',
    });
    return;
  }
  try {
    const serviceResult = await registerService(parsed.data);
    const result = AUTH_CONTRACTS.register.responseBody.parse(serviceResult);
    response.status(201).json(result);
  } catch (error) {
    console.error(error);
    response.status(500).json({
      error: 'Registration error: service failed.',
    });
  }
}
