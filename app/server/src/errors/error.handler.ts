import { AppError } from './app.error.js';
import { ErrorCode } from './error-code.js';
import { HttpStatus } from './http-status.js';
import type { ApiError } from '@summit/shared';
import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from 'express';

export const errorHandler: ErrorRequestHandler = (
  error: AppError | Error,
  _request: Request,
  response: Response,
  next: NextFunction,
) => {
  if (response.headersSent) {
    next(error);
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
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: 'Internal server error.',
    },
  };
  response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(body);
};
