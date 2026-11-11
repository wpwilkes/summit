const AUTH_TOKEN_KEY = 'summit_auth_token';

export async function saveAuthToken(
  token: string
): Promise<void> {
  sessionStorage.setItem(AUTH_TOKEN_KEY, token);
}

export async function getAuthToken(): Promise<string | null> {
  return sessionStorage.getItem(AUTH_TOKEN_KEY);
}

export async function removeAuthToken(): Promise<void> {
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
}
