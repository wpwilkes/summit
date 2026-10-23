import { AppError } from './app.error.js';
import type { ApiError } from '@summit/shared';
import type { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  _next,
) => {
  if (response.headersSent) {
    _next(error);
    return;
  }

  if (error instanceof AppError) {
    const body: ApiError = {
      error: {
        code: error.code,
        message: error.message,
      },
    };
    response.status(error.statusCode).json(body);
    return;
  }

  console.error(error);
  const body: ApiError = {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error.',
    },
  };
  response.status(500).json(body);
};
