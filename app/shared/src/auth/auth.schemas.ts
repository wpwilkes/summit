import { z } from 'zod';

export const UserSchema = z.object({
  id: z.int().positive(),
  email: z.email(),
  username: z.string().min(3).max(30),
  createdAt: z.iso.datetime(),
});
export type User = z.infer<typeof UserSchema>;

export const LoginResponseSchema = z.object({
  user: UserSchema,
  token: z.string().nonempty(),
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const LoginRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(64),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const MeRequestSchema = z.undefined();
export type MeRequest = z.infer<typeof MeRequestSchema>;

export const MeResponseSchema = z.object({
  user: UserSchema,
});
export type MeResponse = z.infer<typeof MeResponseSchema>;

export const RegisterRequestSchema = z.object({
  email: z.email(),
  username: z.string().min(3).max(30),
  password: z.string().min(8).max(64),
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const RegisterResponseSchema = z.object({
  message: z.string(),
});
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;

export const VerifyEmailRequestSchema = z.object({
  email: z.email(),
  code: z.string(),
});
export type VerifyEmailRequest = z.infer<typeof VerifyEmailRequestSchema>;

export const VerifyEmailResponseSchema = z.object({
  message: z.string(),
});
export type VerifyEmailResponse = z.infer<typeof VerifyEmailResponseSchema>;

export const ResendVerificationRequestSchema = z.object({
  email: z.email(),
});
export type ResendVerificationRequest = z.infer<
  typeof ResendVerificationRequestSchema
>;

export const ResendVerificationResponseSchema = z.object({
  message: z.string(),
});
export type ResendVerificationResponse = z.infer<
  typeof ResendVerificationResponseSchema
>;

export const ForgotPasswordRequestSchema = z.object({
  email: z.email(),
});

export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;

export const ForgotPasswordResponseSchema = z.object({
  message: z.string(),
});

export type ForgotPasswordResponse = z.infer<
  typeof ForgotPasswordResponseSchema
>;

export const ResetPasswordRequestSchema = z.object({
  email: z.email(),
  code: z.string().regex(/^\d{6}$/),
  newPassword: z.string().min(8).max(64),
});

export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;

export const ResetPasswordResponseSchema = z.object({
  message: z.string(),
});

export type ResetPasswordResponse = z.infer<typeof ResetPasswordResponseSchema>;
