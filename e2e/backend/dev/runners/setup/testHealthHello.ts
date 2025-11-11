/**
 * Test Health Hello Endpoint Utility for Development Testing
 * Tests the basic API health check endpoint
 */

import type { APIRequestContext, Expect } from '@playwright/test';

interface HealthHelloResponse {
  message: string;
}

/**
 * Test the health hello endpoint
 * @param request - Playwright request object
 * @param expect - Playwright expect function
 * @returns Response data
 */
export async function testHealthHello(
  request: APIRequestContext,
  expect: Expect
): Promise<HealthHelloResponse> {
  console.log('🏥 Testing health hello endpoint...');

  try {
    const response = await request.get("/api/setup/health/hello");

    // Expect successful response
    expect(response.status()).toBe(200);

    const responseData = await response.json() as HealthHelloResponse;

    // Verify response structure and content
    expect(responseData).toHaveProperty('message');
    expect(responseData.message).toBe('Hello World from Dottie API!');

    console.log('✅ Health hello endpoint working correctly');
    return responseData;

  } catch (error) {
    console.error('❌ Health hello endpoint test failed:', (error as Error).message);
    throw error;
  }
}
