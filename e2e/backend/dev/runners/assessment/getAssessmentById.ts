/**
 * Get Assessment By ID Utility for Integration Tests (Playwright)
 */

import type { APIRequestContext } from '@playwright/test';

export interface Assessment {
  id: string;
  user_id: string;
  age?: string;
  cycle_length?: string;
  period_duration?: string;
  flow_heaviness?: string;
  pain_level?: string;
  physical_symptoms?: string[];
  emotional_symptoms?: string[];
  [key: string]: unknown;
}

/**
 * Get a specific assessment by ID
 * @param request - Playwright request object
 * @param token - Authentication token
 * @param assessmentId - Assessment ID
 * @returns Assessment data
 */
export async function getAssessmentById(
  request: APIRequestContext,
  token: string,
  assessmentId: string
): Promise<Assessment> {
  const response = await request.get(`/api/assessment/${assessmentId}`, {
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

  let result: Assessment | undefined;
  try {
    if (responseText) {
      result = JSON.parse(responseText) as Assessment;
    }
  } catch (error) {
    console.error("Failed to parse JSON response:", error);
    throw new Error(`Failed to parse assessment response: ${(error as Error).message}`);
  }

  if (response.status() !== 200) {
    throw new Error(`Failed to get assessment: ${response.status()}`);
  }

  if (!result) {
    throw new Error('No assessment data returned');
  }

  return result;
}
