import { AppError } from '../../errors/app.error.js';
import { ErrorCode } from '../../errors/error-code.js';
import { HttpStatus } from '../../errors/http-status.js';
import { verifyToken } from '../auth.token.js';
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function requireAuth(
  request: Request,
  _response: Response,
  next: NextFunction,
): void {
  const authHeader = request.headers.authorization;
  if (!authHeader) {
    throw new AppError(
      HttpStatus.UNAUTHORIZED,
      ErrorCode.UNAUTHORIZED,
      'Authentication required.',
    );
  }
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
    throw new AppError(
      HttpStatus.UNAUTHORIZED,
      ErrorCode.UNAUTHORIZED,
      'Invalid authorization header.',
    );
  }
  try {
    request.userId = verifyToken(parts[1]);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError(
        HttpStatus.UNAUTHORIZED,
        ErrorCode.INVALID_TOKEN,
        'Invalid or expired token.',
      );
    }
    throw error;
  }
  next();
}
