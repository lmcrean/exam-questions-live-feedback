/**
 * Get All Users Utility for Integration Tests (Playwright)
 */

import type { APIRequestContext } from '@playwright/test';

export interface User {
  id: string;
  username: string;
  email: string;
  [key: string]: unknown;
}

/**
 * Get all users (admin operation)
 * @param request - Playwright request object
 * @param token - Authentication token
 * @returns List of users
 */
export async function getAllUsers(
  request: APIRequestContext,
  token: string
): Promise<User[]> {
  const response = await request.get("/api/user", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Get response as text first
  const responseText = await response.text();

  if (response.status() !== 200) {
    throw new Error(`Failed to get all users: ${response.status()}`);
  }

  // Parse the JSON response
  try {
    return JSON.parse(responseText) as User[];
  } catch (error) {
    console.error("Failed to parse JSON response:", error);
    throw new Error(`Failed to parse users list response: ${(error as Error).message}`);
  }
}
