import {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  ResendVerificationRequest,
  ResetPasswordRequest,
  SignupRequest,
  VerifyEmailRequest,
} from '../types/auth.types';

/*
 * TEMPORARY MOCK AUTHENTICATION SERVICE
 *
 * These functions pretend to be the backend.
 *
 * Later, when the real backend is ready,
 * we will replace the mock logic inside
 * these functions with real HTTP requests.
 */

const MOCK_VERIFICATION_CODE = '123456';

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });

export async function registerUser(
  data: SignupRequest
): Promise<AuthResponse> {
  await wait(500);

  console.log('Mock signup request:', {
    username: data.username,
    email: data.email,
  });

  return {
    success: true,
    message:
      'Account created. Please verify your email.',
  };
}

export async function loginUser(
  data: LoginRequest
): Promise<LoginResponse> {
  await wait(500);

  console.log('Mock login request:', {
    email: data.email,
  });

  return {
    success: true,
    message: 'Login successful.',
    token: 'mock-auth-token',
  };
}

export async function verifyEmail(
  data: VerifyEmailRequest
): Promise<AuthResponse> {
  await wait(500);

  console.log('Mock email verification request:', {
    email: data.email,
    code: data.code,
  });

  if (data.code !== MOCK_VERIFICATION_CODE) {
    return {
      success: false,
      message: 'Invalid verification code.',
    };
  }

  return {
    success: true,
    message: 'Email verified successfully.',
  };
}

export async function resendVerificationCode(
  data: ResendVerificationRequest
): Promise<AuthResponse> {
  await wait(500);

  console.log(
    'Mock resend verification request:',
    {
      email: data.email,
    }
  );

  return {
    success: true,
    message: 'A new verification code was sent.',
  };
}

export async function requestPasswordReset(
  data: ForgotPasswordRequest
): Promise<AuthResponse> {
  await wait(500);

  console.log(
    'Mock password recovery request:',
    {
      email: data.email,
    }
  );

  return {
    success: true,
    message:
      'If an account exists for this email, a recovery code was sent.',
  };
}

export async function resetPassword(
  data: ResetPasswordRequest
): Promise<AuthResponse> {
  await wait(500);

  console.log('Mock reset password request:', {
    email: data.email,
    code: data.code,
  });

  if (data.code !== MOCK_VERIFICATION_CODE) {
    return {
      success: false,
      message: 'Invalid verification code.',
    };
  }

  return {
    success: true,
    message: 'Password reset successfully.',
  };
}