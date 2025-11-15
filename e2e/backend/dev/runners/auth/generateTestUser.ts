/**
 * Generate Test User Utility for Integration Tests
 */

export interface TestUserData {
  username: string;
  email: string;
  password: string;
}

/**
 * Generate unique test user data
 * @returns User data for registration
 */
export function generateTestUser(): TestUserData {
  const timestamp = Date.now();
  return {
    username: `testuser-${timestamp}`,
    email: `test-${timestamp}@example.com`,
    password: "TestPassword123!",
  };
}
