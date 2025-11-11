/**
 * Retrieves conversation details
 * Validates exactly 4 messages are attached (2 user + 2 assistant)
 * Tests conversation data integrity
 */

import type { APIRequestContext } from '@playwright/test';

interface Message {
  role: string;
  content?: string;
  created_at?: string;
  timestamp?: string;
}

interface Conversation {
  messages?: Message[];
  assessment_id?: string;
}

interface GetConversationFailureResult {
  success: false;
  error: string;
  conversation_id: string;
  conversation?: Conversation;
  message_count?: number;
  expected_count?: number;
  user_message_count?: number;
  assistant_message_count?: number;
  expected_user_count?: number;
  expected_assistant_count?: number;
}

interface GetConversationSuccessResult {
  success: true;
  conversation: Conversation;
  message_count: number;
  user_message_count: number;
  assistant_message_count: number;
  message_count_valid: true;
  has_assessment_id: boolean;
  assessment_id?: string;
}

export type GetConversationResult = GetConversationFailureResult | GetConversationSuccessResult;

/**
 * Get a specific conversation by ID and validate message count
 * @param request - Playwright request object
 * @param token - Authentication token
 * @param conversationId - Conversation ID
 * @param expectedMessageCount - Expected total message count (default 4)
 * @returns Conversation with validation results
 */
export async function getConversation(
  request: APIRequestContext,
  token: string,
  conversationId: string,
  expectedMessageCount: number = 4
): Promise<GetConversationResult> {
  try {
    const response = await request.get(`/api/chat/history/${conversationId}`, {
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

    let conversation: Conversation | undefined;
    try {
      if (responseText) {
        conversation = JSON.parse(responseText) as Conversation;
      }
    } catch (error) {
      console.error("Failed to parse JSON response:", error);
      throw new Error(`Failed to parse conversation response: ${(error as Error).message}`);
    }

    if (response.status() !== 200) {
      throw new Error(`Failed to get conversation: ${response.status()}. Response: ${responseText}`);
    }

    if (!conversation) {
      throw new Error("No conversation data received");
    }

    // Validate conversation data integrity
    const messages = conversation.messages || [];
    const userMessages = messages.filter(msg => msg.role === 'user');
    const assistantMessages = messages.filter(msg => msg.role === 'assistant');

    // Check message count validation
    const messageCountCorrect = messages.length === expectedMessageCount;
    const userMessageCountCorrect = userMessages.length === 2;
    const assistantMessageCountCorrect = assistantMessages.length === 2;

    if (!messageCountCorrect) {
      console.error(`❌ Incorrect message count. Expected: ${expectedMessageCount}, Got: ${messages.length}`);
      return {
        success: false,
        error: `Incorrect message count. Expected: ${expectedMessageCount}, Got: ${messages.length}`,
        conversation: conversation,
        message_count: messages.length,
        expected_count: expectedMessageCount,
        user_message_count: userMessages.length,
        assistant_message_count: assistantMessages.length,
        conversation_id: conversationId
      };
    }

    if (!userMessageCountCorrect || !assistantMessageCountCorrect) {
      console.error(`❌ Incorrect message type distribution. User: ${userMessages.length}, Assistant: ${assistantMessages.length}`);
      return {
        success: false,
        error: `Incorrect message type distribution. Expected 2 user and 2 assistant messages.`,
        conversation: conversation,
        message_count: messages.length,
        user_message_count: userMessages.length,
        assistant_message_count: assistantMessages.length,
        expected_user_count: 2,
        expected_assistant_count: 2,
        conversation_id: conversationId
      };
    }

    console.log(`✓ Conversation retrieved successfully`);
    console.log(`✓ Message count validation passed: ${messages.length} messages`);
    console.log(`✓ User messages: ${userMessages.length}, Assistant messages: ${assistantMessages.length}`);
    console.log(`✓ Assessment ID linked: ${conversation.assessment_id || 'None'}`);

    return {
      success: true,
      conversation: conversation,
      message_count: messages.length,
      user_message_count: userMessages.length,
      assistant_message_count: assistantMessages.length,
      message_count_valid: true,
      has_assessment_id: !!conversation.assessment_id,
      assessment_id: conversation.assessment_id
    };

  } catch (error) {
    console.error("❌ Failed to get conversation:", (error as Error).message);
    return {
      success: false,
      error: (error as Error).message,
      conversation_id: conversationId
    };
  }
}

/**
 * Simple conversation retrieval without validation (for debugging)
 * @param request - Playwright request object
 * @param token - Authentication token
 * @param conversationId - Conversation ID
 * @returns Raw conversation data
 */
export async function getConversationRaw(
  request: APIRequestContext,
  token: string,
  conversationId: string
): Promise<Conversation> {
  const response = await request.get(`/api/chat/history/${conversationId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status() !== 200) {
    const responseText = await response.text();
    throw new Error(`Failed to get conversation: ${response.status()}. Response: ${responseText}`);
  }

  return await response.json() as Conversation;
}
