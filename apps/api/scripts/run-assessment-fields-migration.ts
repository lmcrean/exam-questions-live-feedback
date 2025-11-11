/**
 * Script to run the assessment fields migration for conversations table
 * This adds assessment_id and assessment_pattern fields to enable linking
 * conversations to specific assessments
 */

import { db } from '@repo/db';
import { addAssessmentFieldsToConversations } from '@repo/db';

async function runMigration(): Promise<void> {
  try {


    await addAssessmentFieldsToConversations(db);


  } catch (error) {
    console.error('Migration failed:', error as Error);
  } finally {
    // Close database connection
    await db.destroy();
  }
}

// Run the migration
runMigration();
