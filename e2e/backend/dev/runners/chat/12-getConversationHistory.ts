/**
 * Get Conversation History Utility for Integration Tests (Playwright)
 */

import type { APIRequestContext } from '@playwright/test';

interface ConversationItem {
  id: string;
  assessment_id?: string;
  preview?: string | null;
  message_count?: number;
  last_message_date?: string;
}

interface ConversationHistoryResponse {
  conversations?: ConversationItem[];
}

/**
 * Get all conversations for a user
 * @param request - Playwright request object
 * @param token - Authentication token
 * @returns List of conversations
 */
export async function getConversationHistory(
  request: APIRequestContext,
  token: string
): Promise<ConversationItem[]> {
  const response = await request.get("/api/chat/history", {
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

  let result: ConversationHistoryResponse | undefined;
  try {
    if (responseText) {
      result = JSON.parse(responseText) as ConversationHistoryResponse;
    }
  } catch (error) {
    console.error("Failed to parse JSON response:", error);
    throw new Error(`Failed to parse conversation history response: ${(error as Error).message}`);
  }

  if (response.status() !== 200) {
    throw new Error(`Failed to get conversation history: ${response.status()}`);
  }

  // Log conversation details for debugging, especially in prod tests
  const prodEnv = process.env.NODE_ENV === 'production' || process.env.TEST_ENV === 'prod';
  const testType = prodEnv ? 'PROD' : 'DEV';

  console.log(`\n[${testType}] Conversation History Retrieved - Count: ${result?.conversations?.length || 0}`);
  if (result?.conversations && result.conversations.length > 0) {
    result.conversations.forEach((conv, index) => {
      console.log(`\n[${testType}] Conversation ${index + 1}/${result!.conversations!.length}:`);
      console.log(`[${testType}] ID: ${conv.id}`);
      console.log(`[${testType}] Assessment ID: ${conv.assessment_id}`);
      console.log(`[${testType}] Preview: "${conv.preview || 'null'}"`);
      console.log(`[${testType}] Message Count: ${conv.message_count || 0}`);
      console.log(`[${testType}] Last Message Date: ${conv.last_message_date || 'unknown'}`);
    });
    console.log('\n');
  }

  return result?.conversations || [];
}
