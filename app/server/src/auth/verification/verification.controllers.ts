import { AppError } from '../../errors/app.error.js';
import {
  resendVerificationService,
  verifyEmailService,
} from './verification.services.js';
import {
  AUTH_CONTRACTS,
  type VerifyEmailRequest,
  type VerifyEmailResponse,
  type ResendVerificationRequest,
  type ResendVerificationResponse,
} from '@summit/shared';
import type { Request, Response } from 'express';

export async function resendVerificationController(
  request: Request<
    Record<string, never>,
    ResendVerificationResponse,
    ResendVerificationRequest
  >,
  response: Response<ResendVerificationResponse>,
): Promise<void> {
  const parsed = AUTH_CONTRACTS.resendVerification.requestBody.safeParse(
    request.body,
  );
  if (!parsed.success) {
    throw new AppError(400, 'INVALID_REQUEST', 'Invalid resend request.');
  }
  const result = await resendVerificationService(parsed.data);
  const body = AUTH_CONTRACTS.resendVerification.responseBody.parse(result);
  response.status(200).json(body);
}

export async function verifyEmailController(
  request: Request<
    Record<string, never>,
    VerifyEmailResponse,
    VerifyEmailRequest
  >,
  response: Response<VerifyEmailResponse>,
): Promise<void> {
  const parsed = AUTH_CONTRACTS.verifyEmail.requestBody.safeParse(request.body);
  if (!parsed.success) {
    throw new AppError(400, 'INVALID_REQUEST', 'Invalid verification request.');
  }
  const result = await verifyEmailService(parsed.data);
  const body = AUTH_CONTRACTS.verifyEmail.responseBody.parse(result);
  response.status(200).json(body);
}
