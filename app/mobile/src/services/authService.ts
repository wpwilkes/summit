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
 * Register and Login use the real backend.
 *
 * Email verification, resend verification,
 * forgot password, and reset password are still
 * temporary mocks until backend endpoints are ready.
 */

const MOCK_VERIFICATION_CODE = '123456';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL;

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });

type BackendAuthResponse = {
  user: {
    id: number;
    email: string;
    username: string;
    createdAt: string;
  };
  token: string;
};

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
 *
 * The backend may return either:
 *
 * error: "Some error"
 *
 * or:
 *
 * error: {
 *   code: "...",
 *   message: "Some error"
 * }
 */
function getBackendErrorMessage(
  errorData: BackendErrorResponse,
  fallbackMessage: string
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
    throw new Error(
      'EXPO_PUBLIC_API_URL is not configured.'
    );
  }

  return API_BASE_URL.replace(/\/$/, '');
}

/*
 * REAL REGISTRATION
 */
export async function registerUser(
  data: SignupRequest
): Promise<AuthResponse> {
  try {
    const response = await fetch(
      `${getApiBaseUrl()}/api/auth/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          username: data.username,
          password: data.password,
        }),
      }
    );

    const responseData = (await response.json()) as
      | BackendAuthResponse
      | BackendErrorResponse;

    if (!response.ok) {
      const errorData =
        responseData as BackendErrorResponse;

      return {
        success: false,
        message: getBackendErrorMessage(
          errorData,
          'Registration failed. Please try again.'
        ),
      };
    }

    const registerData =
      responseData as BackendAuthResponse;

    if (!registerData.user) {
      return {
        success: false,
        message:
          'Registration failed. User information was not returned.',
      };
    }

    return {
      success: true,
      message:
        'Account created successfully.',
    };
  } catch (error) {
    console.error(
      'Real registration request failed:',
      error
    );

    return {
      success: false,
      message:
        'Could not connect to the Summit server.',
    };
  }
}

/*
 * REAL LOGIN
 */
export async function loginUser(
  data: LoginRequest
): Promise<LoginResponse> {
  try {
    const response = await fetch(
      `${getApiBaseUrl()}/api/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      }
    );

    const responseData = (await response.json()) as
      | BackendAuthResponse
      | BackendErrorResponse;

    if (!response.ok) {
      const errorData =
        responseData as BackendErrorResponse;

      if (response.status === 401) {
        return {
          success: false,
          message:
            'Invalid email or password.',
        };
      }

      return {
        success: false,
        message: getBackendErrorMessage(
          errorData,
          'Login failed. Please try again.'
        ),
      };
    }

    const loginData =
      responseData as BackendAuthResponse;

    if (!loginData.token) {
      return {
        success: false,
        message:
          'Login failed. No authentication token was returned.',
      };
    }

    return {
      success: true,
      message: 'Login successful.',
      token: loginData.token,
    };
  } catch (error) {
    console.error(
      'Real login request failed:',
      error
    );

    return {
      success: false,
      message:
        'Could not connect to the Summit server.',
    };
  }
}

/*
 * MOCK EMAIL VERIFICATION
 */
export async function verifyEmail(
  data: VerifyEmailRequest
): Promise<AuthResponse> {
  await wait(500);

  console.log(
    'Mock email verification request:',
    {
      email: data.email,
      code: data.code,
    }
  );

  if (
    data.code !== MOCK_VERIFICATION_CODE
  ) {
    return {
      success: false,
      message:
        'Invalid verification code.',
    };
  }

  return {
    success: true,
    message:
      'Email verified successfully.',
  };
}

/*
 * MOCK RESEND VERIFICATION
 */
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
    message:
      'A new verification code was sent.',
  };
}

/*
 * MOCK FORGOT PASSWORD
 */
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

/*
 * MOCK RESET PASSWORD
 */
export async function resetPassword(
  data: ResetPasswordRequest
): Promise<AuthResponse> {
  await wait(500);

  console.log(
    'Mock reset password request:',
    {
      email: data.email,
      code: data.code,
    }
  );

  if (
    data.code !== MOCK_VERIFICATION_CODE
  ) {
    return {
      success: false,
      message:
        'Invalid verification code.',
    };
  }

  return {
    success: true,
    message:
      'Password reset successfully.',
  };
}