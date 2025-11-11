/**
 * Test Database Status Endpoint Utility for Development Testing
 * Tests the database connection status check
 */

import type { APIRequestContext, Expect } from '@playwright/test';

interface DatabaseStatusResponse {
  status: string;
}

/**
 * Test the database status endpoint
 * @param request - Playwright request object
 * @param expect - Playwright expect function
 * @returns Response data
 */
export async function testDatabaseStatus(
  request: APIRequestContext,
  expect: Expect
): Promise<DatabaseStatusResponse> {
  console.log('⚡ Testing database status endpoint...');

  try {
    const response = await request.get("/api/setup/database/status");

    // For dev environment, expect successful response (stricter requirements)
    expect(response.status()).toBe(200);

    const responseData = await response.json() as DatabaseStatusResponse;

    // Verify response structure
    expect(responseData).toHaveProperty('status');

    // For dev environment, expect connected status
    expect(responseData.status).toBe('connected');

    console.log('✅ Database status endpoint working correctly');
    console.log(`   Status: ${responseData.status}`);

    return responseData;

  } catch (error) {
    console.error('❌ Database status endpoint test failed:', (error as Error).message);
    throw error;
  }
}
