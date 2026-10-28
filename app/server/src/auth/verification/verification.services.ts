import { AppError } from '../../errors/app.error.js';
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
  const message =
    'If this account requires verification, a new code will be generated when allowed.';
  if (!user || user.emailVerifiedAt !== null) {
    return { message };
  }
  const verification = createVerificationCode(email);
  const replaced = await replaceVerificationCode(
    user.id,
    verification.codeHash,
    verification.expiresAt,
  );
  if (replaced) {
    sendVerificationCode(email, verification.code);
  }
  return { message };
}

export async function verifyEmailService(
  request: VerifyEmailRequest,
): Promise<VerifyEmailResponse> {
  const email = request.email.trim().toLowerCase();
  const codeHash = hashVerificationCode(email, request.code);
  const verified = await consumeVerificationCode(email, codeHash);
  if (!verified) {
    throw new AppError(
      400,
      'INVALID_VERIFICATION_CODE',
      'Invalid, expired, or already used verification code.',
    );
  }
  return {
    message: 'Email verified. You can now log in.',
  };
}
