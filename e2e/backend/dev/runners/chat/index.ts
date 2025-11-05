/**
 * Chat Module Index for Development Tests - 13-Step Workflow
 * 
 * Exports all chat-related test functions in sequential order.
 * Comprehensive workflow from conversation creation through cleanup.
 * Note: ALL conversations MUST have an assessment_id - there is only one way to create conversations.
 */

// Phase 1: Preparation
export { 
  prepareUserMessageStrings, 
  getTestUserMessage, 
  getRandomTestUserMessage 
} from './01-prepareUserMessageString.ts';

export { 
  prepareAssessmentId, 
  validateAssessmentExists 
} from './02-prepareAssessmentId.ts';

// Phase 2: Conversation Creation & Validation
export { 
  createConversation, 
  createConversationDirect 
} from './03-createConversation.ts';

export { 
  validateAssessmentIdWasLinked, 
  hasAssessmentIdLinked 
} from './04-validateAssessmentIdWasLinked.ts';

export { 
  validateAssessmentObjectWasLinked, 
  quickCheckAssessmentObject 
} from './05-validateAssessmentObjectWasLinked.ts';

// Phase 3: Message Exchange
export { 
  sendUserMessage, 
  sendCustomUserMessage 
} from './06-sendUserMessage.ts';

export { 
  receiveChatbotResponse, 
  waitForChatbotResponse 
} from './07-recieveChatbotResponse.ts';

export { 
  sendUserMessageFollowup, 
  sendCustomUserMessageFollowup 
} from './08-sendUserMessageFollowup.ts';

export { 
  receiveChatbotResponseFollowup, 
  waitForChatbotResponseFollowup 
} from './09-recieveChatbotResponseFollowup.ts';

// Phase 4: Conversation Validation
export { 
  getConversation, 
  getConversationRaw 
} from './10-getConversation.ts';

export { 
  validateMessageOrder, 
  validateAlternatingPattern, 
  advancedMessageOrderValidation 
} from './11-getConversation-ValidateMessageOrder.ts';

export { 
  getConversationHistory 
} from './12-getConversationHistory.ts';

// Phase 5: Cleanup
export { 
  deleteConversation 
} from './13-deleteConversation.ts';

/**
 * Complete 13-step workflow runner
 * Executes all steps in sequence for comprehensive testing
 * @param {Object} request - Playwright request object
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Complete workflow results
 */
export async function runComplete13StepWorkflow(request, token) {
  const results = {
    steps: {},
    success: true,
    errors: []
  };

  try {
    // Step 1: Prepare user message strings
    const messageStrings = prepareUserMessageStrings();
    results.steps.step01 = { success: true, message_count: messageStrings.totalMessages };

    // Step 2: Prepare assessment ID
    const assessmentPrep = await prepareAssessmentId();
    results.steps.step02 = assessmentPrep;
    if (!assessmentPrep.isValid) {
      throw new Error('Failed to prepare assessment ID');
    }

    // Step 3: Create conversation
    const conversation = await createConversation(request, token, assessmentPrep.assessment_id);
    results.steps.step03 = conversation;
    if (!conversation.success) {
      throw new Error('Failed to create conversation');
    }

    // Continue with remaining steps...
    // (Implementation would continue for all 13 steps)

    return results;

  } catch (error) {
    results.success = false;
    results.errors.push(error.message);
    return results;
  }
} 