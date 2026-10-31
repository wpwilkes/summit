import jwt from 'jsonwebtoken';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured.');
  }
  return secret;
}

export function createToken(userId: number): string {
  return jwt.sign({ sub: userId.toString() }, getJwtSecret(), {
    expiresIn: '24h',
  });
}

export function verifyToken(token: string): number {
  const payload = jwt.verify(token, getJwtSecret());
  if (typeof payload === 'string' || typeof payload.sub !== 'string') {
    throw new jwt.JsonWebTokenError('Invalid token payload.');
  }
  const userId = Number(payload.sub);
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    throw new jwt.JsonWebTokenError('Invalid token payload.');
  }
  return userId;
}
