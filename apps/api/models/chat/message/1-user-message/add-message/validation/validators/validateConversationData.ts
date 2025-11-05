import type { ExtendedValidationResult } from '../../../../../types.ts';
import { validateRequiredFields } from './validateRequiredFields.ts';
import { validateUserId } from './validateUserId.ts';
import { validateAssessmentId } from './validateAssessmentId.ts';

/**
 * Conversation data for validation
 */
interface ConversationData {
  user_id?: string | number;
  assessment_id?: string | number | null;
  [key: string]: any;
}

/**
 * Validate conversation creation data
 * @param conversationData - Conversation data to validate
 * @param context - Context for error messages
 * @returns Validation result
 */
export const validateConversationData = (
  conversationData: ConversationData,
  context: string = 'conversation creation'
): ExtendedValidationResult => {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  // Validate required fields
  const requiredValidation = validateRequiredFields(
    conversationData,
    ['user_id'],
    context
  );
  allErrors.push(...requiredValidation.errors);

  // Validate user_id specifically
  if (conversationData.user_id) {
    const userIdValidation = validateUserId(conversationData.user_id, context);
    allErrors.push(...userIdValidation.errors);
  }

  // Validate assessment_id if present
  if (conversationData.assessment_id) {
    const assessmentValidation = validateAssessmentId(conversationData.assessment_id, context);
    allErrors.push(...assessmentValidation.errors);
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    context
  };
};
