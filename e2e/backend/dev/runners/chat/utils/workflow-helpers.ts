/**
 * Workflow Helper Utilities
 * Common operations used across chat workflows
 */

import type { Expect } from '@playwright/test';

interface Conversation {
  id?: string;
  assessment_id?: string;
  messages?: unknown[];
  preview?: string | null;
  [key: string]: unknown;
}

interface ConversationCreationResult {
  conversationId?: string;
  assessment_id?: string;
  [key: string]: unknown;
}

interface MessageSendResult {
  success: boolean;
  conversationId: string;
  message?: unknown;
  [key: string]: unknown;
}

/**
 * Log workflow step with emoji and message
 * @param step - Step description
 * @param emoji - Emoji for the step
 */
export function logWorkflowStep(step: string, emoji: string = '✅'): void {
    console.log(`${emoji} ${step}`);
}

/**
 * Create expectation validator for conversation properties
 * @param expect - Playwright expect function
 * @param conversation - Conversation object to validate
 * @param expectedConversationId - Expected conversation ID
 * @param expectedAssessmentId - Expected assessment ID
 */
export function validateConversationExpectations(
  expect: Expect,
  conversation: Conversation,
  expectedConversationId: string,
  expectedAssessmentId: string
): void {
    expect(conversation).toHaveProperty('id', expectedConversationId);
    expect(conversation).toHaveProperty('assessment_id', expectedAssessmentId);
    expect(conversation).toHaveProperty('messages');
    expect(Array.isArray(conversation.messages)).toBe(true);
    expect(conversation.messages!.length).toBeGreaterThan(0);
}

/**
 * Validate conversation creation result
 * @param expect - Playwright expect function
 * @param result - Conversation creation result
 * @param expectedAssessmentId - Expected assessment ID
 * @returns Conversation ID
 */
export function validateConversationCreation(
  expect: Expect,
  result: ConversationCreationResult,
  expectedAssessmentId: string
): string {
    expect(result).toHaveProperty('conversationId');
    expect(result.conversationId).toBeTruthy();
    expect(result.assessment_id).toBe(expectedAssessmentId);
    return result.conversationId!;
}

/**
 * Validate message send result
 * @param expect - Playwright expect function
 * @param result - Message send result
 * @param expectedConversationId - Expected conversation ID
 */
export function validateMessageSendResult(
  expect: Expect,
  result: MessageSendResult,
  expectedConversationId: string
): void {
    expect(result.success).toBe(true);
    expect(result.conversationId).toBe(expectedConversationId);
    expect(result).toHaveProperty('message');
}

/**
 * Validate conversation appears in history
 * @param expect - Playwright expect function
 * @param conversations - Array of conversations from history
 * @param conversationId - Conversation ID to find
 * @param assessmentId - Expected assessment ID
 * @returns Found conversation
 */
export function validateConversationInHistory(
  expect: Expect,
  conversations: Conversation[],
  conversationId: string,
  assessmentId: string
): Conversation {
    const foundConversation = conversations.find(conv => conv.id === conversationId);
    expect(foundConversation).toBeTruthy();
    expect(foundConversation!.assessment_id).toBe(assessmentId);

    // Validate preview field exists and is from assistant message
    console.log(`Conversation preview: "${foundConversation!.preview || 'null'}"`);

    // Preview should not be null in production tests
    const isProdTest = process.env.NODE_ENV === 'production' || process.env.TEST_ENV === 'prod';
    if (isProdTest) {
        // In production, preview should never be null after our fix
        expect(foundConversation!.preview).not.toBeNull();
        expect(typeof foundConversation!.preview).toBe('string');
        expect((foundConversation!.preview as string).length).toBeGreaterThan(0);

        // Preview should be from assistant (likely contains terms like "relief", "pain", etc.)
        // This is just a simple heuristic check, not comprehensive
        const preview = foundConversation!.preview as string;
        const containsLikelyAssistantTerms =
            preview.includes('pain') ||
            preview.includes('relief') ||
            preview.includes('period') ||
            preview.includes('self-care');

        expect(containsLikelyAssistantTerms).toBe(true);
    }

    return foundConversation!;
}
