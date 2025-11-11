/**
 * Update User Profile Utility for Integration Tests (Playwright)
 */

import type { APIRequestContext } from '@playwright/test';

export interface ProfileData {
  username?: string;
  age?: string;
  [key: string]: unknown;
}

export interface UpdatedUser {
  id: string;
  username: string;
  email: string;
  [key: string]: unknown;
}

/**
 * Update user profile information
 * @param request - Playwright request object
 * @param token - Authentication token
 * @param userId - User ID (not used directly but kept for API compatibility)
 * @param profileData - Updated profile data
 * @returns Updated user data
 */
export async function updateUserProfile(
  request: APIRequestContext,
  token: string,
  userId: string,
  profileData: ProfileData
): Promise<UpdatedUser> {
  // Use the /me endpoint which updates the current user based on the token
  const response = await request.put(`/api/user/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: profileData,
  });

  const responseText = await response.text();

  if (response.status() !== 200) {
    throw new Error(`Failed to update user profile: ${response.status()}`);
  }

  // Parse the JSON response
  try {
    return JSON.parse(responseText) as UpdatedUser;
  } catch (error) {
    console.error("Failed to parse JSON response:", error);
    throw new Error(`Failed to parse update response: ${(error as Error).message}`);
  }
}
