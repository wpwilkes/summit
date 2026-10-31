import { AppError } from '../../errors/app.error.js';
import { ErrorCode } from '../../errors/error-code.js';
import { HttpStatus } from '../../errors/http-status.js';
import { findByEmail } from '../auth.repositories.js';
import {
  createVerificationCode,
  hashVerificationCode,
} from './verification.code.js';
import { sendVerificationCode } from './verification.console.js';
import {
  consumeVerificationCode,
  replaceVerificationCode,
} from './verification.repositories.js';
import type {
  VerifyEmailRequest,
  VerifyEmailResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
} from '@summit/shared';

export async function resendVerificationService(
  request: ResendVerificationRequest,
): Promise<ResendVerificationResponse> {
  const email = request.email.trim().toLowerCase();
  const user = await findByEmail(email);
  if (!user) {
    throw new AppError(
      HttpStatus.NOT_FOUND,
      ErrorCode.USER_NOT_FOUND,
      'That email is not registered.',
    );
  }
  if (user.emailVerified) {
    throw new AppError(
      HttpStatus.FORBIDDEN,
      ErrorCode.USER_ALREADY_EXISTS,
      'That email is already verified.',
    );
  }
  const verification = createVerificationCode(email);
  await replaceVerificationCode(user.id, verification.codeHash);
  sendVerificationCode(email, verification.code);
  return { message: 'New verification code sent.' };
}

export async function verifyEmailService(
  request: VerifyEmailRequest,
): Promise<VerifyEmailResponse> {
  const email = request.email.trim().toLowerCase();
  const codeHash = hashVerificationCode(email, request.code);
  const user = await consumeVerificationCode(email, codeHash);
  if (!user || !user.emailVerified) {
    throw new AppError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.INVALID_VERIFICATION_CODE,
      'Invalid verification code.',
    );
  }
  return {
    message: 'Email verified. You can now log in.',
  };
}
