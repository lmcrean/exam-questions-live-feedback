/**
 * CRITICAL BUG TEST: Validates message sequence is correct
 * Expected order: user → assistant → user → assistant
 * Uses centralized utility functions for validation
 */

import type { APIRequestContext } from '@playwright/test';
import {
    validateMessageCount,
    validateAlternatingPattern,
    getExpectedPattern
} from './utils/expectedMessageCount.js';

interface Message {
  role: string;
  content?: string;
  created_at?: string;
  timestamp?: string;
}

interface ConversationResponse {
  messages?: Message[];
}

interface MessageAnalysis {
  index: number;
  role: string;
  timestamp?: string;
  content_preview: string;
  expected_role: string;
}

interface MessageOrderFailureResult {
  success: false;
  error: string;
  conversation_id: string;
  expected_pattern?: string[];
  actual_pattern?: string[];
  is_chronological?: boolean;
  message_analysis?: MessageAnalysis[];
  bug_detected?: boolean;
  timestamp_bug_detected?: boolean;
  message_count?: number;
  expected_count?: number;
}

interface MessageOrderSuccessResult {
  success: true;
  message_count: number;
  pattern_correct: true;
  is_chronological: true;
  expected_pattern: string[];
  actual_pattern: string[];
  message_analysis: MessageAnalysis[];
  conversation_id: string;
  production_bug_not_detected: true;
}

export type MessageOrderValidationResult = MessageOrderFailureResult | MessageOrderSuccessResult;

/**
 * Validate that messages are in correct chronological order
 * @param request - Playwright request object
 * @param token - Authentication token
 * @param conversationId - Conversation ID to validate
 * @param expectedMessageCount - Expected total message count (default 4)
 * @returns Validation result with detailed message order analysis
 */
export async function validateMessageOrder(
  request: APIRequestContext,
  token: string,
  conversationId: string,
  expectedMessageCount: number = 4
): Promise<MessageOrderValidationResult> {
  try {
    // Get conversation details
    const response = await request.get(`/api/chat/history/${conversationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status() !== 200) {
      const responseText = await response.text();
      throw new Error(`Failed to get conversation: ${response.status()}. Response: ${responseText}`);
    }

    const conversation = await response.json() as ConversationResponse;
    const messages = conversation.messages || [];

    // Use utility for message count validation
    const countValidation = validateMessageCount(messages, expectedMessageCount);
    if (!countValidation.success) {
      return {
        success: false,
        error: countValidation.error,
        message_count: countValidation.actual,
        expected_count: countValidation.expected,
        conversation_id: conversationId
      };
    }

    // Use utility for pattern validation
    const expectedPattern = getExpectedPattern(expectedMessageCount);
    const actualPattern = messages.map(msg => msg.role);
    const patternMatches = JSON.stringify(actualPattern) === JSON.stringify(expectedPattern);

    // Check chronological order
    const timestamps = messages.map(msg => new Date(msg.created_at || msg.timestamp || ''));
    const isChronological = timestamps.every((timestamp, index) => {
      if (index === 0) return true;
      return timestamp >= timestamps[index - 1];
    });

    // Create message analysis
    const messageAnalysis: MessageAnalysis[] = messages.map((msg, index) => ({
      index: index,
      role: msg.role,
      timestamp: msg.created_at || msg.timestamp,
      content_preview: (msg.content || '').substring(0, 50) + '...',
      expected_role: expectedPattern[index]
    }));

    if (!patternMatches) {
      console.error(`❌ Message order is incorrect!`);
      console.error(`Expected: ${expectedPattern.join(' → ')}`);
      console.error(`Actual:   ${actualPattern.join(' → ')}`);

      return {
        success: false,
        error: 'Message order is incorrect - production bug detected!',
        expected_pattern: expectedPattern,
        actual_pattern: actualPattern,
        is_chronological: isChronological,
        message_analysis: messageAnalysis,
        conversation_id: conversationId,
        bug_detected: true
      };
    }

    if (!isChronological) {
      console.error(`❌ Messages are not in chronological order!`);

      return {
        success: false,
        error: 'Messages are not in chronological timestamp order',
        expected_pattern: expectedPattern,
        actual_pattern: actualPattern,
        is_chronological: false,
        message_analysis: messageAnalysis,
        conversation_id: conversationId,
        timestamp_bug_detected: true
      };
    }

    console.log(`✓ Message order validation PASSED`);
    console.log(`✓ Pattern: ${actualPattern.join(' → ')}`);

    return {
      success: true,
      message_count: messages.length,
      pattern_correct: true,
      is_chronological: true,
      expected_pattern: expectedPattern,
      actual_pattern: actualPattern,
      message_analysis: messageAnalysis,
      conversation_id: conversationId,
      production_bug_not_detected: true
    };

  } catch (error) {
    console.error("❌ Failed to validate message order:", (error as Error).message);
    return {
      success: false,
      error: (error as Error).message,
      conversation_id: conversationId
    };
  }
}

// Re-export utility function for backward compatibility
export { validateAlternatingPattern };

/**
 * Advanced message order validation with detailed error reporting
 * @param request - Playwright request object
 * @param token - Authentication token
 * @param conversationId - Conversation ID to validate
 * @returns Detailed validation result
 */
export async function advancedMessageOrderValidation(
  request: APIRequestContext,
  token: string,
  conversationId: string
): Promise<MessageOrderValidationResult> {
  const result = await validateMessageOrder(request, token, conversationId);

  if (result.success) {
    return result;
  }

  // Additional debugging for failed cases
  console.log(`🔍 Advanced debugging for conversation ${conversationId}:`);
  console.log(`🔍 Message count: ${result.message_count}`);
  console.log(`🔍 Expected pattern: ${result.expected_pattern?.join(' → ')}`);
  console.log(`🔍 Actual pattern: ${result.actual_pattern?.join(' → ')}`);

  if (result.message_analysis) {
    console.log(`🔍 Detailed message analysis:`);
    result.message_analysis.forEach(msg => {
      const status = msg.role === msg.expected_role ? '✓' : '❌';
      console.log(`  ${status} Message ${msg.index}: ${msg.role} (expected: ${msg.expected_role}) - ${msg.content_preview}`);
    });
  }

  return result;
}
