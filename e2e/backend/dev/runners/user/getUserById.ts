/**
 * Get User By ID Utility for Integration Tests (Playwright)
 */

import type { APIRequestContext } from '@playwright/test';

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  [key: string]: unknown;
}

/**
 * Get user information by ID
 * @param request - Playwright request object
 * @param token - Authentication token
 * @param userId - User ID (not used directly but kept for API compatibility)
 * @returns User data
 */
export async function getUserById(
  request: APIRequestContext,
  token: string,
  userId: string
): Promise<UserInfo> {
  // Use the /me endpoint which returns the current user based on the token
  const response = await request.get(`/api/user/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Get response as text first
  const responseText = await response.text();

  if (response.status() !== 200) {
    throw new Error(`Failed to get user info: ${response.status()}`);
  }

  // Parse the JSON response
  try {
    return JSON.parse(responseText) as UserInfo;
  } catch (error) {
    console.error("Failed to parse JSON response:", error);
    throw new Error(`Failed to parse user info response: ${(error as Error).message}`);
  }
}
