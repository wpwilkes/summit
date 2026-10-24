import { AppError } from '../errors/app.error.js';
import {
  createUser,
  findByEmail,
  findById,
  findByUsername,
} from './auth.repositories.js';
import type {
  LoginRequest,
  LoginResponse,
  MeResponse,
  RegisterRequest,
  RegisterResponse,
  User as UserContract,
} from '@summit/shared';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

type PrismaUser = {
  id: number;
  email: string;
  username: string;
  createdAt: Date;
  passwordHash: string;
};

type TokenPayload = {
  sub: string;
};

function createToken(sub: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('`JWT_SECRET` is not configured.');
  }
  const payload: TokenPayload = {
    sub: sub,
  };
  return jwt.sign(payload, secret, {
    expiresIn: '24h',
  });
}

function toUserContract(user: PrismaUser): UserContract {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function loginService(
  request: LoginRequest,
): Promise<LoginResponse> {
  const email = request.email.trim().toLowerCase();
  const user = await findByEmail(email);
  if (!user) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email.');
  }
  const passwordIsValid = await argon2.verify(
    user.passwordHash,
    request.password,
  );
  if (!passwordIsValid) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid password.');
  }
  return {
    user: toUserContract(user),
    token: createToken(user.id.toString()),
  };
}

export async function getMe(userId: number): Promise<MeResponse> {
  const user = await findById(userId);
  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'User not found.');
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
    throw new AppError(409, 'EMAIL_TAKEN', 'Email already registered.');
  }
  const existingUsername = await findByUsername(username);
  if (existingUsername) {
    throw new AppError(409, 'USERNAME_TAKEN', 'Username already taken.');
  }
  const passwordHash = await argon2.hash(request.password);
  const user = await createUser(email, username, passwordHash);
  return {
    user: toUserContract(user),
    token: createToken(user.id.toString()),
  };
}
