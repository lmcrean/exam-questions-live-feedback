/**
 * Validates assessment_id was properly linked to conversation
 * Tests database relationship integrity between conversations and assessments
 */

import type { APIRequestContext } from '@playwright/test';

interface ConversationResponse {
  assessment_id?: string;
}

interface ValidationFailureResult {
  success: false;
  error: string;
  conversation_id: string;
  expected_assessment_id: string;
  actual_assessment_id?: string | null;
}

interface ValidationSuccessResult {
  success: true;
  conversation_id: string;
  assessment_id: string;
  validation_passed: true;
}

export type AssessmentIdValidationResult = ValidationFailureResult | ValidationSuccessResult;

/**
 * Validate that conversation has the correct assessment_id linked
 * @param request - Playwright request object
 * @param token - Authentication token
 * @param conversationId - Conversation ID to verify
 * @param expectedAssessmentId - Expected assessment ID
 * @returns Validation result with success status and details
 */
export async function validateAssessmentIdWasLinked(
  request: APIRequestContext,
  token: string,
  conversationId: string,
  expectedAssessmentId: string
): Promise<AssessmentIdValidationResult> {
  try {
    const response = await request.get(`/api/chat/history/${conversationId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status() !== 200) {
      const responseText = await response.text();
      throw new Error(`Failed to get conversation details: ${response.status()}. Response: ${responseText}`);
    }

    const conversation = await response.json() as ConversationResponse;

    // Check if assessment_id exists and matches expected value
    const hasAssessmentId = !!conversation.assessment_id;
    const assessmentIdMatches = conversation.assessment_id === expectedAssessmentId;

    if (!hasAssessmentId) {
      console.error(`❌ Conversation ${conversationId} has no assessment_id linked`);
      return {
        success: false,
        error: 'No assessment_id found in conversation',
        conversation_id: conversationId,
        expected_assessment_id: expectedAssessmentId,
        actual_assessment_id: null
      };
    }

    if (!assessmentIdMatches) {
      console.error(`❌ Assessment ID mismatch. Expected: ${expectedAssessmentId}, Got: ${conversation.assessment_id}`);
      return {
        success: false,
        error: 'Assessment ID mismatch',
        conversation_id: conversationId,
        expected_assessment_id: expectedAssessmentId,
        actual_assessment_id: conversation.assessment_id
      };
    }

    console.log(`✓ Assessment ID correctly linked: ${conversation.assessment_id}`);
    return {
      success: true,
      conversation_id: conversationId,
      assessment_id: conversation.assessment_id,
      validation_passed: true
    };

  } catch (error) {
    console.error("❌ Failed to validate assessment ID linking:", (error as Error).message);
    return {
      success: false,
      error: (error as Error).message,
      conversation_id: conversationId,
      expected_assessment_id: expectedAssessmentId
    };
  }
}

/**
 * Quick check if conversation has any assessment_id (not checking specific value)
 * @param request - Playwright request object
 * @param token - Authentication token
 * @param conversationId - Conversation ID to check
 * @returns True if conversation has an assessment_id
 */
export async function hasAssessmentIdLinked(
  request: APIRequestContext,
  token: string,
  conversationId: string
): Promise<boolean> {
  try {
    const result = await validateAssessmentIdWasLinked(request, token, conversationId, '');
    return result.success && !!(result as ValidationSuccessResult).assessment_id;
  } catch (error) {
    console.error("Failed to check assessment ID linking:", (error as Error).message);
    return false;
  }
}
