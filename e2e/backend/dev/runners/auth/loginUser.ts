/**
 * Login User Utility for Integration Tests (Playwright)
 */

import type { APIRequestContext } from '@playwright/test';

export interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

/**
 * Login with existing user credentials
 * @param request - Playwright request object
 * @param credentials - Login credentials
 * @returns Authentication token
 */
export async function loginUser(
  request: APIRequestContext,
  credentials: LoginCredentials
): Promise<string> {
  const response = await request.post("/api/auth/login", {
    data: {
      email: credentials.email,
      password: credentials.password,
    },
  });

  const data = await response.json() as LoginResponse;

  if (response.status() !== 200) {
    console.error("Login failed:", data);
    throw new Error(`Failed to login: ${response.status()}`);
  }

  if (!data.token) {
    console.error("No token in login response:", data);
    throw new Error("Invalid login response format");
  }

  return data.token;
}
