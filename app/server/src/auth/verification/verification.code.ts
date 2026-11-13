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
  if (!process.env.ENABLE_DEMO_MODE || !process.env.DEMO_MODE_CODE) {
    throw new Error('ENABLE_DEMO_MODE or DEMO_MODE_CODE is not configured.');
  }
  const inDemoMode = process.env.ENABLE_DEMO_MODE == 'true';
  const code = inDemoMode
    ? process.env.DEMO_MODE_CODE
    : randomInt(0, 1_000_000).toString().padStart(6, '0');
  return {
    code,
    codeHash: hashVerificationCode(email, code),
  };
}
