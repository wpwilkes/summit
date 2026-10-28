import { createHmac, randomInt } from 'node:crypto';

export function hashVerificationCode(email: string, code: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured.');
  }
  return createHmac('sha256', secret)
    .update(`summit:email-verification:${email}:${code}`)
    .digest('hex');
}

export function createVerificationCode(email: string) {
  const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
  return {
    code,
    codeHash: hashVerificationCode(email, code),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  };
}
