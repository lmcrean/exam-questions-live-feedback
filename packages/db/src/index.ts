/**
 * @repo/db - Shared database package
 *
 * This package provides centralized database functionality for the Ed Tech App monorepo.
 * It includes database connection management, migrations, and common database operations.
 */

// Export database connection
export { db, dbType, default as database } from './database.ts';

// Export types
export type {
  DbRecord,
  PartialDbRecord,
  WhereCondition,
  QueryOptions,
  DeleteOption,
  ConversationPreview,
  IDbService,
  OperatorValue,
  SortOrder
} from './types.ts';

// Export database service (default class interface)
export { default as DbService } from './service/index.ts';

// Export individual service functions
export {
  findById,
  findBy,
  findWhere,
  exists,
  create,
  update,
  delete as deleteRecord,
  getAll,
  getConversationsWithPreviews,
  createWithJson,
  findByIdWithJson,
  findByFieldWithJson,
  updateWithJson,
  updateWhere
} from './service/index.ts';

// Export migrations
export * from './migrations/index.ts';
