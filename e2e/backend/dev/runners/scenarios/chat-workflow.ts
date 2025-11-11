/**
 * Chat Workflow Scenarios for Development Tests
 * Uses granular chat utility functions and common utilities
 *
 * IMPORTANT: ALL conversations MUST have an assessment_id linked.
 */

import type { APIRequestContext, Expect } from '@playwright/test';
import * as chat from '../chat/index.js';
import {
    collectAssessmentId,
    getTestUserMessage,
    validateConversationStructure,
    logWorkflowStep,
    validateConversationCreation,
    validateConversationExpectations,
    validateMessageSendResult,
    validateConversationInHistory
} from '../chat/utils/index.js';

/**
 * Run complete chat conversation workflow with assessment context
 *
 * @param request - Playwright request object
 * @param expect - Playwright expect function
 * @param authToken - Authentication token
 * @param assessmentId - Assessment ID for context (REQUIRED)
 * @returns Conversation ID
 */
export async function runChatWithAssessmentWorkflow(
    request: APIRequestContext,
    expect: Expect,
    authToken: string,
    assessmentId: string
): Promise<string> {
    logWorkflowStep('Starting Chat with Assessment Workflow (DEV)', '💬🩺');

    // Create new conversation by sending initial message with assessment context
    const conversationResult = await chat.createConversation(request, authToken, assessmentId);
    const conversationId = validateConversationCreation(expect, conversationResult, assessmentId);
    logWorkflowStep('Created conversation with assessment context (DEV)');

    // Verify the conversation was properly linked to the assessment
    const linkValidation = await chat.validateAssessmentIdWasLinked(request, authToken, conversationId, assessmentId);
    expect(linkValidation.success).toBe(true);
    logWorkflowStep('Verified assessment-conversation link (DEV)');

    // Get conversation details and validate structure
    const conversationDetails = await chat.getConversationRaw(request, authToken, conversationId);
    validateConversationExpectations(expect, conversationDetails, conversationId, assessmentId);
    logWorkflowStep('Verified conversation includes assessment data (DEV)');

    // Validate initial message structure
    const structureValidation = validateConversationStructure(conversationDetails, conversationDetails.messages.length);
    expect(structureValidation.success).toBe(true);
    expect(conversationDetails.messages[0].role).toBe("user");
    logWorkflowStep('Initial message structure validated (DEV)');

    // Send follow-up message to maintain assessment context
    const followUpResult = await chat.sendUserMessageFollowup(request, authToken, conversationId, 1);
    validateMessageSendResult(expect, followUpResult, conversationId);
    logWorkflowStep('Follow-up message sent successfully (DEV)');

    // Validate updated conversation with 4 messages
    const updatedConversationResponse = await chat.getConversation(request, authToken, conversationId, 4);
    expect(updatedConversationResponse.success).toBe(true);

    const messageOrderValidation = await chat.validateMessageOrder(request, authToken, conversationId, 4);
    expect(messageOrderValidation.success).toBe(true);
    logWorkflowStep('Follow-up chatbot response validated (DEV)');

    // Verify conversation appears in history with assessment link
    const conversations = await chat.getConversationHistory(request, authToken);
    validateConversationInHistory(expect, conversations, conversationId, assessmentId);
    logWorkflowStep('Conversation appears in history with assessment link (DEV)');

    logWorkflowStep('Chat with Assessment Workflow completed successfully (DEV)!', '🎉');
    return conversationId;
}

/**
 * Delete conversation and verify it's removed
 * @param request - Playwright request object
 * @param expect - Playwright expect function
 * @param authToken - Authentication token
 * @param conversationId - Conversation ID to delete
 */
export async function deleteAndVerifyConversation(
    request: APIRequestContext,
    expect: Expect,
    authToken: string,
    conversationId: string
): Promise<void> {
    const deleteResult = await chat.deleteConversation(request, authToken, conversationId);
    expect(deleteResult).toBe(true);

    const conversationsAfterDelete = await chat.getConversationHistory(request, authToken);
    const deletedConversation = conversationsAfterDelete.find(conv => conv.id === conversationId);
    expect(deletedConversation).toBeFalsy();
}
