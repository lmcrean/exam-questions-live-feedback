/**
 * Create Assessment Utility for Integration Tests (Playwright)
 */

import type { APIRequestContext } from '@playwright/test';
import type { AssessmentData } from './generateDefaultAssessment.js';

interface CreateAssessmentResponse {
  id: string;
}

/**
 * Create a new assessment
 * @param request - Playwright request object
 * @param token - Authentication token
 * @param userId - User ID
 * @param assessmentData - Assessment data
 * @returns Assessment ID
 */
export async function createAssessment(
  request: APIRequestContext,
  token: string,
  userId: string,
  assessmentData: AssessmentData | null = null
): Promise<string> {
  // Import the default assessment generator if needed
  const { generateDefaultAssessment } = await import('./generateDefaultAssessment.js');

  // If no assessment data provided, use default test data
  const data = assessmentData || generateDefaultAssessment();

  // Convert to flattened format with snake_case fields
  const flattenedData = {
    userId: userId,
    // Use the flattened format fields directly
    assessmentData: {
      // These are direct fields, not nested
      age: data.age,
      cycle_length: data.cycleLength,
      period_duration: data.periodDuration,
      flow_heaviness: data.flowHeaviness,
      pain_level: data.painLevel,
      physical_symptoms: data.symptoms?.physical || [],
      emotional_symptoms: data.symptoms?.emotional || [],
      recommendations: data.recommendations || [], // Include recommendations
      pattern: data.pattern // Include the calculated pattern
    }
  };

  const response = await request.post("/api/assessment/send", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: flattenedData,
  });

  let responseText: string | undefined;
  try {
    responseText = await response.text();
  } catch (error) {
    console.error("Failed to get response text:", error);
  }

  let result: CreateAssessmentResponse | undefined;
  try {
    if (responseText) {
      result = JSON.parse(responseText) as CreateAssessmentResponse;
    }
  } catch (error) {
    console.error("Failed to parse JSON response:", error);
    throw new Error(`Failed to parse assessment creation response: ${(error as Error).message}`);
  }

  if (response.status() !== 201) {
    throw new Error(`Failed to create assessment: ${response.status()}`);
  }

  if (!result) {
    throw new Error('No result from assessment creation');
  }

  return result.id;
}
