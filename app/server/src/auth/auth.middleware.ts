import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export function requireAuth(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const authHeader = request.headers.authorization;
  if (!authHeader) {
    return response.status(401).json({
      error: 'Authentication required.',
    });
  }

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return response.status(401).json({
      error: 'Invalid authorization header.',
    });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return response.status(500).json({
      error: 'Server authentication configuration error.',
    });
  }

  try {
    const payload = jwt.verify(token, secret);
    if (typeof payload === 'string' || typeof payload.sub !== 'string') {
      return response.status(401).json({
        error: 'Invalid token.',
      });
    }

    const userId = Number(payload.sub);
    if (!Number.isInteger(userId)) {
      return response.status(401).json({
        error: 'Invalid token.',
      });
    }

    request.userId = userId;

    next();
  } catch {
    return response.status(401).json({
      error: 'Invalid or expired token.',
    });
  }
}
