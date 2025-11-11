/**
 * Register User Utility for Integration Tests (Playwright)
 */

import type { APIRequestContext } from '@playwright/test';

export interface UserData {
  username: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  id: string;
}

export interface RegistrationResult {
  userId: string;
  userData: RegisterResponse;
  token: null;
}

/**
 * Register a new user
 * @param request - Playwright request object
 * @param userData - User data for registration
 * @returns Result with user ID and token
 */
export async function registerUser(
  request: APIRequestContext,
  userData: UserData
): Promise<RegistrationResult> {
  const response = await request.post("/api/auth/signup", {
    data: userData,
  });

  const data = await response.json() as RegisterResponse;

  if (response.status() !== 201) {
    console.error("Registration failed:", data);
    throw new Error(`Failed to register user: ${response.status()}`);
  }

  // The API directly returns the user object and doesn't wrap it in a 'user' property
  // and the token is generated separately - we'll handle this by logging in after registration
  return {
    userId: data.id, // Use the user ID directly from the response
    userData: data,
    // We'll need to log in to get the token
    token: null,
  };
}
