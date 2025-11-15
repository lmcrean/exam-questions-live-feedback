/**
 * Sends initial user message using prepared string content
 * Tests user message creation and storage
 */

import type { APIRequestContext } from '@playwright/test';
import { getTestUserMessage } from './01-prepareUserMessageString.js';

interface MessageFailureResult {
  success: false;
  error: string;
  conversationId: string;
  messageIndex: number;
}

interface MessageSuccessResult {
  success: true;
  message: string;
  conversationId: string;
  messageIndex: number;
  response: unknown;
}

export type SendMessageResult = MessageFailureResult | MessageSuccessResult;

/**
 * Send initial user message to an existing conversation
 * @param request - Playwright request object
 * @param token - Authentication token
 * @param conversationId - Existing conversation ID
 * @param messageIndex - Index of message to use from prepared strings (0-5)
 * @returns Response containing message details
 */
export async function sendUserMessage(
  request: APIRequestContext,
  token: string,
  conversationId: string,
  messageIndex: number = 0
): Promise<SendMessageResult> {
  try {
    const userMessage = getTestUserMessage(messageIndex);

    console.log(`Sending user message (index ${messageIndex}): "${userMessage.substring(0, 50)}..."`);

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
      throw new Error(`Failed to parse send message response: ${(error as Error).message}`);
    }

    if (response.status() !== 200) {
      console.error("Error response text:", responseText);
      throw new Error(`Failed to send user message: ${response.status()}. Response: ${responseText}`);
    }

    console.log(`✓ User message sent successfully`);
    console.log(`✓ Message content: "${userMessage}"`);

    return {
      success: true,
      message: userMessage,
      conversationId: conversationId,
      messageIndex: messageIndex,
      response: result
    };

  } catch (error) {
    console.error("❌ Failed to send user message:", (error as Error).message);
    return {
      success: false,
      error: (error as Error).message,
      conversationId: conversationId,
      messageIndex: messageIndex
    };
  }
}

interface CustomMessageFailureResult {
  success: false;
  error: string;
  conversationId: string;
  message: string;
}

interface CustomMessageSuccessResult {
  success: true;
  message: string;
  conversationId: string;
  response: unknown;
}

export type SendCustomMessageResult = CustomMessageFailureResult | CustomMessageSuccessResult;

/**
 * Send user message with custom content (not from prepared strings)
 * @param request - Playwright request object
 * @param token - Authentication token
 * @param conversationId - Existing conversation ID
 * @param customMessage - Custom message content
 * @returns Response containing message details
 */
export async function sendCustomUserMessage(
  request: APIRequestContext,
  token: string,
  conversationId: string,
  customMessage: string
): Promise<SendCustomMessageResult> {
  try {
    console.log(`Sending custom user message: "${customMessage.substring(0, 50)}..."`);

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
      throw new Error(`Failed to send custom user message: ${response.status()}. Response: ${responseText}`);
    }

    const result = await response.json();

    console.log(`✓ Custom user message sent successfully`);

    return {
      success: true,
      message: customMessage,
      conversationId: conversationId,
      response: result
    };

  } catch (error) {
    console.error("❌ Failed to send custom user message:", (error as Error).message);
    return {
      success: false,
      error: (error as Error).message,
      conversationId: conversationId,
      message: customMessage
    };
  }
}
