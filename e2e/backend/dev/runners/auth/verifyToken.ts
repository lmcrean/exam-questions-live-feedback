/**
 * Verify Token Utility for Integration Tests (Playwright)
 */

import type { APIRequestContext } from '@playwright/test';

/**
 * Verify authentication token is valid
 * @param request - Playwright request object
 * @param token - Authentication token
 * @returns True if token is valid
 * @throws Error if token is invalid or verification fails
 */
export async function verifyToken(
  request: APIRequestContext,
  token: string
): Promise<boolean> {
  // Try to access a protected endpoint to verify the token

  if (!token) {
    throw new Error("No token provided for verification");
  }

  try {
    const response = await request.get("/api/auth/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status() !== 200) {
      throw new Error(`Token verification failed with status: ${response.status()}`);
    }

    return true;
  } catch (error) {
    if ((error as Error).message.includes('Token verification failed')) {
      throw error;
    }
    throw new Error(`Token verification error: ${(error as Error).message}`);
  }
}
