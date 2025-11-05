import type { ValidationResult } from '../../../../../types.ts';
import { validateMessageLength } from './validateMessageLength.ts';
import { validateSimpleMessageContent } from './validateSimpleMessageContent.ts';

/**
 * Combined message text validation
 * @param content - Message content to validate
 * @returns Validation result
 */
export const validateMessageText = (content: string | undefined | null): ValidationResult => {
  // Combined message text validation
  const lengthValidation = validateMessageLength(content);
  if (!lengthValidation.isValid) {
    return lengthValidation;
  }

  const contentValidation = validateSimpleMessageContent(content);
  if (!contentValidation.isValid) {
    return contentValidation;
  }

  return { isValid: true };
};
