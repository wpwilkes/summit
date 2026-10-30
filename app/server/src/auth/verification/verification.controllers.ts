import { AppError } from '../../errors/app.error.js';
import { ErrorCode } from '../../errors/error-code.js';
import { HttpStatus } from '../../errors/http-status.js';
import { BodyRequest } from '../../types/requests.js';
import {
  verifyEmailService,
  resendVerificationService,
} from './verification.services.js';
import {
  AUTH_CONTRACTS,
  type ResendVerificationRequest,
  type ResendVerificationResponse,
  type VerifyEmailRequest,
  type VerifyEmailResponse,
} from '@summit/shared';
import type { Response } from 'express';

export async function resendVerificationController(
  request: BodyRequest<ResendVerificationRequest>,
  response: Response<ResendVerificationResponse>,
): Promise<void> {
  const parsed = AUTH_CONTRACTS.resendVerification.requestBody.safeParse(
    request.body,
  );
  if (!parsed.success) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.INVALID_REQUEST,
      'Invalid resend request.',
    );
  }
  const result = await resendVerificationService(parsed.data);
  response.status(HttpStatus.OK).json(result);
}

export async function verifyEmailController(
  request: BodyRequest<VerifyEmailRequest>,
  response: Response<VerifyEmailResponse>,
): Promise<void> {
  const parsed = AUTH_CONTRACTS.verifyEmail.requestBody.safeParse(request.body);
  if (!parsed.success) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.INVALID_REQUEST,
      'Invalid verification request.',
    );
  }
  const result = await verifyEmailService(parsed.data);
  response.status(HttpStatus.OK).json(result);
}
