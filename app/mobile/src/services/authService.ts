import { AUTH_CONTRACTS } from '@summit/shared';

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
 * AUTHENTICATION SERVICE
 *
 * Register, Login, Email Verification, and
 * Resend Verification use the real backend
 * and the shared API contracts.
 *
 * Forgot Password and Reset Password are still
 * temporary mocks until their backend endpoints
 * are available.
 */

const MOCK_VERIFICATION_CODE = '123456';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });

type BackendErrorObject = {
  code?: string;
  message?: string;
};

type BackendErrorResponse = {
  error?: string | BackendErrorObject;
  message?: string;
};

/*
 * Return a readable error message from the backend.
 */
function getBackendErrorMessage(
  errorData: BackendErrorResponse,
  fallbackMessage: string,
): string {
  if (
    typeof errorData.error === 'object' &&
    errorData.error !== null &&
    errorData.error.message
  ) {
    return errorData.error.message;
  }

  if (typeof errorData.error === 'string') {
    return errorData.error;
  }

  if (errorData.message) {
    return errorData.message;
  }

  return fallbackMessage;
}

function getApiBaseUrl(): string {
  if (!API_BASE_URL) {
    throw new Error('EXPO_PUBLIC_API_URL is not configured.');
  }

  return API_BASE_URL.replace(/\/$/, '');
}

/*
 * REAL REGISTRATION
 *
 * Registration creates an unverified account.
 * The backend does not return a token yet.
 *
 * After registration succeeds, the Signup screen
 * sends the user to Email Verification.
 */
export async function registerUser(
  data: SignupRequest,
): Promise<AuthResponse> {
  try {
    const response = await fetch(
      `${getApiBaseUrl()}${AUTH_CONTRACTS.register.path}`,
      {
        method: AUTH_CONTRACTS.register.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
    );

    const responseData = await response.json();

    if (!response.ok) {
      const errorData = responseData as BackendErrorResponse;

      return {
        success: false,
        message: getBackendErrorMessage(
          errorData,
          'Registration failed. Please try again.',
        ),
      };
    }

    const parsedResponse =
      AUTH_CONTRACTS.register.responseBody.safeParse(responseData);

    if (!parsedResponse.success) {
      console.error(
        'Invalid registration response:',
        parsedResponse.error,
      );

      return {
        success: false,
        message:
          'Registration failed. Invalid response from the server.',
      };
    }

    return {
      success: true,
      message: parsedResponse.data.message,
    };
  } catch (error) {
    console.error('Real registration request failed:', error);

    return {
      success: false,
      message: 'Could not connect to the Summit server.',
    };
  }
}

/*
 * REAL LOGIN
 *
 * A user can log in only after email verification.
 * The token is returned here, not during registration.
 */
export async function loginUser(
  data: LoginRequest,
): Promise<LoginResponse> {
  try {
    const response = await fetch(
      `${getApiBaseUrl()}${AUTH_CONTRACTS.login.path}`,
      {
        method: AUTH_CONTRACTS.login.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
    );

    const responseData = await response.json();

    if (!response.ok) {
      const errorData = responseData as BackendErrorResponse;

      if (response.status === 401) {
        return {
          success: false,
          message: 'Invalid email or password.',
        };
      }

      return {
        success: false,
        message: getBackendErrorMessage(
          errorData,
          'Login failed. Please try again.',
        ),
      };
    }

    const parsedResponse =
      AUTH_CONTRACTS.login.responseBody.safeParse(responseData);

    if (!parsedResponse.success) {
      console.error(
        'Invalid login response:',
        parsedResponse.error,
      );

      return {
        success: false,
        message:
          'Login failed. Invalid response from the server.',
      };
    }

    return {
      success: true,
      message: 'Login successful.',
      token: parsedResponse.data.token,
    };
  } catch (error) {
    console.error('Real login request failed:', error);

    return {
      success: false,
      message: 'Could not connect to the Summit server.',
    };
  }
}

/*
 * REAL EMAIL VERIFICATION
 *
 * The verification code is currently printed
 * in the Docker server logs instead of being
 * sent through a real email provider.
 */
export async function verifyEmail(
  data: VerifyEmailRequest,
): Promise<AuthResponse> {
  try {
    const response = await fetch(
      `${getApiBaseUrl()}${AUTH_CONTRACTS.verifyEmail.path}`,
      {
        method: AUTH_CONTRACTS.verifyEmail.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
    );

    const responseData = await response.json();

    if (!response.ok) {
      const errorData = responseData as BackendErrorResponse;

      return {
        success: false,
        message: getBackendErrorMessage(
          errorData,
          'Email verification failed. Please try again.',
        ),
      };
    }

    const parsedResponse =
      AUTH_CONTRACTS.verifyEmail.responseBody.safeParse(
        responseData,
      );

    if (!parsedResponse.success) {
      console.error(
        'Invalid email verification response:',
        parsedResponse.error,
      );

      return {
        success: false,
        message:
          'Email verification failed. Invalid response from the server.',
      };
    }

    return {
      success: true,
      message: parsedResponse.data.message,
    };
  } catch (error) {
    console.error(
      'Real email verification request failed:',
      error,
    );

    return {
      success: false,
      message: 'Could not connect to the Summit server.',
    };
  }
}

/*
 * REAL RESEND VERIFICATION
 *
 * A new verification code is generated by the backend.
 * During development, the code appears in the
 * Docker server logs.
 */
export async function resendVerificationCode(
  data: ResendVerificationRequest,
): Promise<AuthResponse> {
  try {
    const response = await fetch(
      `${getApiBaseUrl()}${AUTH_CONTRACTS.resendVerification.path}`,
      {
        method: AUTH_CONTRACTS.resendVerification.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
    );

    const responseData = await response.json();

    if (!response.ok) {
      const errorData = responseData as BackendErrorResponse;

      return {
        success: false,
        message: getBackendErrorMessage(
          errorData,
          'Unable to resend the verification code.',
        ),
      };
    }

    const parsedResponse =
      AUTH_CONTRACTS.resendVerification.responseBody.safeParse(
        responseData,
      );

    if (!parsedResponse.success) {
      console.error(
        'Invalid resend verification response:',
        parsedResponse.error,
      );

      return {
        success: false,
        message:
          'Unable to resend the verification code. Invalid response from the server.',
      };
    }

    return {
      success: true,
      message: parsedResponse.data.message,
    };
  } catch (error) {
    console.error(
      'Real resend verification request failed:',
      error,
    );

    return {
      success: false,
      message: 'Could not connect to the Summit server.',
    };
  }
}

/*
 * MOCK FORGOT PASSWORD
 */
export async function requestPasswordReset(
  data: ForgotPasswordRequest,
): Promise<AuthResponse> {
  await wait(500);

  console.log('Mock password recovery request:', {
    email: data.email,
  });

  return {
    success: true,
    message:
      'If an account exists for this email, a recovery code was sent.',
  };
}

/*
 * MOCK RESET PASSWORD
 */
export async function resetPassword(
  data: ResetPasswordRequest,
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