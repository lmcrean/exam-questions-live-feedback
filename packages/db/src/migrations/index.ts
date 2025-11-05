/**
 * Database migrations
 * Export all migrations for easy access
 */

import * as initialSchema from './initialSchema.ts';
import * as assessmentSchema from './assessmentSchema.ts';
import * as updateAssessmentToJsonSchema from './updateAssessmentToJsonSchema.ts';
import * as addAssessmentFieldsToConversations from './addAssessmentFieldsToConversations.ts';
import * as addAssessmentObjectToConversations from './addAssessmentObjectToConversations.ts';
import * as updateFlattenedAssessmentSchema from './updateFlattenedAssessmentSchema.ts';
import * as fixChatTimestampColumns from './fixChatTimestampColumns.ts';
import * as addPreviewToConversations from './20240528_add_preview_to_conversations.ts';
import * as addRefreshTokens from './20250112_add_refresh_tokens.ts';
import * as addOtherSymptoms from './add-other-symptoms.ts';
import * as addDeletedAtToUsers from './addDeletedAtToUsers.ts';

// Export as named modules to avoid conflicts
export {
  initialSchema,
  assessmentSchema,
  updateAssessmentToJsonSchema,
  addAssessmentFieldsToConversations,
  addAssessmentObjectToConversations,
  updateFlattenedAssessmentSchema,
  fixChatTimestampColumns,
  addPreviewToConversations,
  addRefreshTokens,
  addOtherSymptoms,
  addDeletedAtToUsers
};

// Re-export the main schema creation functions
export { createTables, dropTables } from './initialSchema.ts';
