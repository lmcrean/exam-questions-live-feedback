/**
 * Get Assessments Utility for Integration Tests (Playwright)
 */

import type { APIRequestContext } from '@playwright/test';
import type { Assessment } from './getAssessmentById.js';

/**
 * Get all assessments for a user
 * @param request - Playwright request object
 * @param token - Authentication token
 * @returns List of assessments
 */
export async function getAssessments(
  request: APIRequestContext,
  token: string
): Promise<Assessment[]> {
  const response = await request.get("/api/assessment/list", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  let responseText: string | undefined;
  try {
    responseText = await response.text();
  } catch (error) {
    console.error("Failed to get response text:", error);
  }

  // If we get a 404 (no assessments found), return an empty array
  if (response.status() === 404) {
    return [];
  }

  let result: Assessment[] | undefined;
  try {
    if (responseText) {
      result = JSON.parse(responseText) as Assessment[];
    }
  } catch (error) {
    console.error("Failed to parse JSON response:", error);
    throw new Error(`Failed to parse assessments list response: ${(error as Error).message}`);
  }

  if (response.status() !== 200) {
    throw new Error(`Failed to get assessments: ${response.status()}`);
  }

  return result || [];
}
