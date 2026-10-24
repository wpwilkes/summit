import { AppError } from '../errors/app.error.js';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export function requireAuth(
  request: Request,
  _response: Response,
  next: NextFunction,
): void {
  const authHeader = request.headers.authorization;
  if (!authHeader) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
    throw new AppError(
      401,
      'INVALID_AUTH_HEADER',
      'Invalid authorization header.',
    );
  }

  const token = parts[1];
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured.');
  }

  let payload: jwt.JwtPayload | string;
  try {
    payload = jwt.verify(token, secret);
  } catch {
    throw new AppError(401, 'INVALID_TOKEN', 'Invalid or expired token.');
  }

  if (typeof payload === 'string' || typeof payload.sub !== 'string') {
    throw new AppError(401, 'INVALID_TOKEN', 'Invalid token.');
  }

  const userId = Number(payload.sub);
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    throw new AppError(401, 'INVALID_TOKEN', 'Invalid token.');
  }
  request.userId = userId;

  next();
}
