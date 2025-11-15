/**
 * Generate Profile Update Data Utility for Integration Tests
 */

export interface ProfileUpdateData {
  username: string;
  age: string;
}

/**
 * Generate random profile data for updating user
 * @param usernamePrefix - Prefix for username
 * @returns Profile update data
 */
export function generateProfileUpdate(usernamePrefix: string = "updated"): ProfileUpdateData {
  const timestamp = Date.now();
  return {
    username: `${usernamePrefix}_${timestamp}`,
    age: "25_34",
  };
}
