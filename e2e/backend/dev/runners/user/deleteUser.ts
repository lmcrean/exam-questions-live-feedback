/**
 * Delete User Utility for Integration Tests (Playwright)
 */

import type { APIRequestContext } from '@playwright/test';

/**
 * Delete a user account
 * @param request - Playwright request object
 * @param token - Authentication token
 * @param userId - User ID
 * @returns True if deleted successfully
 */
export async function deleteUser(
  request: APIRequestContext,
  token: string,
  userId: string
): Promise<boolean> {
  const response = await request.delete(`/api/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  try {
    const responseText = await response.text();
  } catch (error) {
    console.error("Failed to get delete response text:", error);
  }

  return response.status() === 200;
}
