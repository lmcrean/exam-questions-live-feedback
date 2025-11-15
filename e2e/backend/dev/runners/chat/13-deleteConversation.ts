/**
 * Delete Conversation Utility for Integration Tests (Playwright)
 */

import type { APIRequestContext } from '@playwright/test';

/**
 * Delete a conversation
 * @param request - Playwright request object
 * @param token - Authentication token
 * @param conversationId - Conversation ID
 * @returns True if successfully deleted
 */
export async function deleteConversation(
  request: APIRequestContext,
  token: string,
  conversationId: string
): Promise<boolean> {
  const response = await request.delete(`/api/chat/history/${conversationId}`, {
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

  if (response.status() !== 200) {
    throw new Error(`Failed to delete conversation: ${response.status()}`);
  }

  return true;
}
