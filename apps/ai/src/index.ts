/**
 * AI Services Module
 * Exports utilities for PDF processing with Google Gemini
 */

// Export utilities
export { initGemini, processPDF, processPDFBatch } from './utils/geminiClient.ts';

// Export services
export { geminiRateLimiter } from './services/geminiRateLimiter.ts';

// Export types
export type {
  GeminiConfig,
  PDFProcessingResult,
  RateLimitStats,
  TestResult
} from './types/index.ts';
