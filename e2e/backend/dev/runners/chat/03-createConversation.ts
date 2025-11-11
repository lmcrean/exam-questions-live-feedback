/**
 * Creates conversation object with assessment_id parameter
 * Establishes the conversation-assessment relationship
 * This is the ONLY way to create a conversation - assessment_id is REQUIRED
 */

import type { APIRequestContext } from '@playwright/test';

interface CreateConversationResponse {
  conversationId: string;
}

export interface ConversationCreationResult {
  conversationId: string;
  assessment_id: string;
  success: boolean;
}

/**
 * Create a new conversation linked to an assessment
 * @param request - Playwright request object
 * @param token - Authentication token
 * @param assessment_id - Assessment ID for context (REQUIRED)
 * @returns Response containing conversationId and assessment_id
 */
export async function createConversation(
  request: APIRequestContext,
  token: string,
  assessment_id: string
): Promise<ConversationCreationResult> {
  // For now, we create conversations by sending the first message
  // This is how the current codebase works - conversations are created implicitly
  // TODO: Create dedicated conversation creation endpoint if needed

  const payload = {
    message: "Starting conversation for assessment", // Temporary message to create conversation
    assessment_id: assessment_id
  };

  const response = await request.post("/api/chat/send", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: payload,
  });

  let responseText: string | undefined;
  try {
    responseText = await response.text();
  } catch (error) {
    console.error("Failed to get response text:", error);
  }

  let result: CreateConversationResponse | undefined;
  try {
    if (responseText) {
      result = JSON.parse(responseText) as CreateConversationResponse;
    }
  } catch (error) {
    console.error("Failed to parse JSON response:", error);
    console.error("Response text:", responseText);
    throw new Error(`Failed to parse create conversation response: ${(error as Error).message}`);
  }

  if (response.status() !== 200) {
    console.error("Error response text:", responseText);
    throw new Error(`Failed to create conversation: ${response.status()}. Response: ${responseText}`);
  }

  if (!result) {
    throw new Error("No response data received");
  }

  console.log(`✓ Conversation created with ID: ${result.conversationId}`);
  console.log(`✓ Linked to assessment_id: ${assessment_id}`);

  return {
    conversationId: result.conversationId,
    assessment_id: assessment_id,
    success: true
  };
}

/**
 * Alternative: Create conversation using dedicated endpoint (if it exists)
 * This would be the preferred method if we had a dedicated conversation creation endpoint
 */
export async function createConversationDirect(
  request: APIRequestContext,
  token: string,
  assessment_id: string
): Promise<ConversationCreationResult> {
  // This would be the implementation if we had a dedicated endpoint
  // For now, fallback to the message-based creation
  return await createConversation(request, token, assessment_id);
}
