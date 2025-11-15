/**
 * Sends second user message (DRY principles, reusing logic from step 6)
 * Uses different string from prepared messages
 * Tests ongoing conversation flow
 */

import type { APIRequestContext } from '@playwright/test';
import { getTestUserMessage } from './01-prepareUserMessageString.js';

interface FollowupMessageFailureResult {
  success: false;
  error: string;
  conversationId: string;
  messageIndex: number;
  isFollowup: true;
}

interface FollowupMessageSuccessResult {
  success: true;
  message: string;
  conversationId: string;
  messageIndex: number;
  isFollowup: true;
  response: unknown;
}

export type SendFollowupMessageResult = FollowupMessageFailureResult | FollowupMessageSuccessResult;

/**
 * Send follow-up user message to continue conversation
 * Reuses logic from 06-sendUserMessage.js but with different message content
 * @param request - Playwright request object
 * @param token - Authentication token
 * @param conversationId - Existing conversation ID
 * @param messageIndex - Index of message to use from prepared strings (default 1, different from initial)
 * @returns Response containing message details
 */
export async function sendUserMessageFollowup(
  request: APIRequestContext,
  token: string,
  conversationId: string,
  messageIndex: number = 1
): Promise<SendFollowupMessageResult> {
  try {
    const userMessage = getTestUserMessage(messageIndex);

    console.log(`Sending follow-up user message (index ${messageIndex}): "${userMessage.substring(0, 50)}..."`);

    const payload = {
      message: userMessage,
      conversationId: conversationId
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

    let result: unknown;
    try {
      if (responseText) {
        result = JSON.parse(responseText);
      }
    } catch (error) {
      console.error("Failed to parse JSON response:", error);
      console.error("Response text:", responseText);
      throw new Error(`Failed to parse follow-up message response: ${(error as Error).message}`);
    }

    if (response.status() !== 200) {
      console.error("Error response text:", responseText);
      throw new Error(`Failed to send follow-up user message: ${response.status()}. Response: ${responseText}`);
    }

    console.log(`✓ Follow-up user message sent successfully`);
    console.log(`✓ Message content: "${userMessage}"`);
    console.log(`✓ This is the second user message in the conversation`);

    return {
      success: true,
      message: userMessage,
      conversationId: conversationId,
      messageIndex: messageIndex,
      isFollowup: true,
      response: result
    };

  } catch (error) {
    console.error("❌ Failed to send follow-up user message:", (error as Error).message);
    return {
      success: false,
      error: (error as Error).message,
      conversationId: conversationId,
      messageIndex: messageIndex,
      isFollowup: true
    };
  }
}

interface CustomFollowupFailureResult {
  success: false;
  error: string;
  conversationId: string;
  message: string;
  isFollowup: true;
}

interface CustomFollowupSuccessResult {
  success: true;
  message: string;
  conversationId: string;
  isFollowup: true;
  response: unknown;
}

export type SendCustomFollowupResult = CustomFollowupFailureResult | CustomFollowupSuccessResult;

/**
 * Send follow-up message with custom content
 * @param request - Playwright request object
 * @param token - Authentication token
 * @param conversationId - Existing conversation ID
 * @param customMessage - Custom follow-up message content
 * @returns Response containing message details
 */
export async function sendCustomUserMessageFollowup(
  request: APIRequestContext,
  token: string,
  conversationId: string,
  customMessage: string
): Promise<SendCustomFollowupResult> {
  try {
    console.log(`Sending custom follow-up user message: "${customMessage.substring(0, 50)}..."`);

    const payload = {
      message: customMessage,
      conversationId: conversationId
    };

    const response = await request.post("/api/chat/send", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: payload,
    });

    if (response.status() !== 200) {
      const responseText = await response.text();
      throw new Error(`Failed to send custom follow-up message: ${response.status()}. Response: ${responseText}`);
    }

    const result = await response.json();

    console.log(`✓ Custom follow-up user message sent successfully`);

    return {
      success: true,
      message: customMessage,
      conversationId: conversationId,
      isFollowup: true,
      response: result
    };

  } catch (error) {
    console.error("❌ Failed to send custom follow-up user message:", (error as Error).message);
    return {
      success: false,
      error: (error as Error).message,
      conversationId: conversationId,
      message: customMessage,
      isFollowup: true
    };
  }
}
