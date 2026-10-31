import { AppError } from '../errors/app.error.js';
import { ErrorCode } from '../errors/error-code.js';
import { HttpStatus } from '../errors/http-status.js';
import { toUserContract } from './auth.mappers.js';
import {
  createUnverifiedUser,
  findByEmail,
  findById,
  findByUsername,
} from './auth.repositories.js';
import { createToken } from './auth.token.js';
import type {
  LoginRequest,
  LoginResponse,
  MeResponse,
  RegisterRequest,
  RegisterResponse,
} from '@summit/shared';
import { createVerificationCode } from './verification/verification.code.js';
import { sendVerificationCode } from './verification/verification.console.js';
import argon2 from 'argon2';

export async function loginService(
  request: LoginRequest,
): Promise<LoginResponse> {
  const email = request.email.trim().toLowerCase();
  const user = await findByEmail(email);
  if (!user) {
    throw new AppError(
      HttpStatus.NOT_FOUND,
      ErrorCode.INVALID_CREDENTIALS,
      'Invalid email.',
    );
  }
  const passwordIsValid = await argon2.verify(
    user.passwordHash,
    request.password,
  );
  if (!passwordIsValid) {
    throw new AppError(
      HttpStatus.UNAUTHORIZED,
      ErrorCode.INVALID_CREDENTIALS,
      'Invalid password.',
    );
  }
  if (!user.emailVerified) {
    throw new AppError(
      HttpStatus.FORBIDDEN,
      ErrorCode.EMAIL_NOT_VERIFIED,
      'Verify your email before logging in.',
    );
  }
  return {
    user: toUserContract(user),
    token: createToken(user.id),
  };
}

export async function getMe(userId: number): Promise<MeResponse> {
  const user = await findById(userId);
  if (!user) {
    throw new AppError(
      HttpStatus.NOT_FOUND,
      ErrorCode.USER_NOT_FOUND,
      'User not found.',
    );
  }
  return {
    user: toUserContract(user),
  };
}

export async function registerService(
  request: RegisterRequest,
): Promise<RegisterResponse> {
  const email = request.email.trim().toLowerCase();
  const username = request.username.trim();
  const existingEmail = await findByEmail(email);
  if (existingEmail) {
    throw new AppError(
      HttpStatus.CONFLICT,
      ErrorCode.EMAIL_TAKEN,
      'Email already registered.',
    );
  }
  const existingUsername = await findByUsername(username);
  if (existingUsername) {
    throw new AppError(
      HttpStatus.CONFLICT,
      ErrorCode.USERNAME_TAKEN,
      'Username already taken.',
    );
  }
  const passwordHash = await argon2.hash(request.password);
  const verification = createVerificationCode(email);
  await createUnverifiedUser(
    email,
    username,
    passwordHash,
    verification.codeHash,
  );
  sendVerificationCode(email, verification.code);
  return {
    message: 'Registration successful. Verify your email before logging in.',
  };
}
