/**
 * Delete Assessment Utility for Integration Tests (Playwright)
 */

import type { APIRequestContext } from '@playwright/test';

/**
 * Delete an assessment
 * @param request - Playwright request object
 * @param token - Authentication token
 * @param userId - User ID
 * @param assessmentId - Assessment ID
 * @returns True if deleted successfully
 */
export async function deleteAssessment(
  request: APIRequestContext,
  token: string,
  userId: string,
  assessmentId: string
): Promise<boolean> {
  // Use the correct endpoint format with both userId and assessmentId
  const response = await request.delete(
    `/api/assessment/${userId}/${assessmentId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  // Log the response for debugging
  try {
    const responseText = await response.text();
  } catch (error) {
    console.error("Failed to get delete response text:", error);
  }

  return response.status() === 200 || response.status() === 204;
}
