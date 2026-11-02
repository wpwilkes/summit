import { createHmac, randomInt } from 'node:crypto';

export function hashPasswordResetCode(email: string, code: string): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not configured.');
  }

  return createHmac('sha256', secret)
    .update(`summit:password-reset:${email}:${code}`)
    .digest('hex');
}

export function createPasswordResetCode(email: string) {
  const code = randomInt(0, 1_000_000).toString().padStart(6, '0');

  return {
    code,
    codeHash: hashPasswordResetCode(email, code),
  };
}
