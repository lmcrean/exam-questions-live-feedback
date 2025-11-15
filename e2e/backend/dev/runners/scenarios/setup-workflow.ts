/**
 * Setup Workflow Scenarios for Development Testing
 *
 * Tests all setup endpoints to verify system health and database connectivity
 */

import type { APIRequestContext, Expect } from '@playwright/test';
import { testHealthHello } from '../setup/testHealthHello.js';
import { testDatabaseHello } from '../setup/testDatabaseHello.js';
import { testDatabaseStatus } from '../setup/testDatabaseStatus.js';

interface SetupWorkflowResult {
  success: boolean;
  results: {
    healthHello?: unknown;
    databaseHello?: unknown;
    databaseStatus?: unknown;
  };
}

interface SetupTestResult {
  success: boolean;
  error: string | null;
}

interface IndividualSetupTestsResult {
  summary: {
    passed: number;
    total: number;
  };
  results: {
    healthHello: SetupTestResult;
    databaseHello: SetupTestResult;
    databaseStatus: SetupTestResult;
  };
}

/**
 * Complete setup workflow test
 * Tests all setup endpoints in sequence
 */
export async function runSetupWorkflow(
  request: APIRequestContext,
  expect: Expect
): Promise<SetupWorkflowResult> {
  console.log('🔧 Starting Setup Workflow...');

  try {
    const results: SetupWorkflowResult['results'] = {};

    // Step 1: Test basic API health
    console.log('\n--- Step 1: Testing API Health ---');
    results.healthHello = await testHealthHello(request, expect);

    // Step 2: Test database connection with hello
    console.log('\n--- Step 2: Testing Database Hello ---');
    results.databaseHello = await testDatabaseHello(request, expect);

    // Step 3: Test database status check
    console.log('\n--- Step 3: Testing Database Status ---');
    results.databaseStatus = await testDatabaseStatus(request, expect);

    console.log('\n🎉 Setup Workflow completed successfully!');
    console.log('✅ All setup endpoints are working correctly');

    return {
      success: true,
      results: results
    };

  } catch (error) {
    console.error('\n❌ Setup Workflow failed:', (error as Error).message);
    throw error;
  }
}

/**
 * Individual setup endpoint tests
 * Run each setup test independently for debugging
 */
export async function runIndividualSetupTests(
  request: APIRequestContext,
  expect: Expect
): Promise<IndividualSetupTestsResult> {
  console.log('🔧 Starting Individual Setup Tests...');

  const results: IndividualSetupTestsResult['results'] = {
    healthHello: { success: false, error: null },
    databaseHello: { success: false, error: null },
    databaseStatus: { success: false, error: null }
  };

  // Test 1: Health Hello
  try {
    console.log('\n--- Testing Health Hello Endpoint ---');
    await testHealthHello(request, expect);
    results.healthHello.success = true;
    console.log('✅ Health Hello: PASSED');
  } catch (error) {
    results.healthHello.error = (error as Error).message;
    console.log('❌ Health Hello: FAILED -', (error as Error).message);
  }

  // Test 2: Database Hello
  try {
    console.log('\n--- Testing Database Hello Endpoint ---');
    await testDatabaseHello(request, expect);
    results.databaseHello.success = true;
    console.log('✅ Database Hello: PASSED');
  } catch (error) {
    results.databaseHello.error = (error as Error).message;
    console.log('❌ Database Hello: FAILED -', (error as Error).message);
  }

  // Test 3: Database Status
  try {
    console.log('\n--- Testing Database Status Endpoint ---');
    await testDatabaseStatus(request, expect);
    results.databaseStatus.success = true;
    console.log('✅ Database Status: PASSED');
  } catch (error) {
    results.databaseStatus.error = (error as Error).message;
    console.log('❌ Database Status: FAILED -', (error as Error).message);
  }

  // Summary
  const passedTests = Object.values(results).filter(test => test.success).length;
  const totalTests = Object.keys(results).length;

  console.log(`\n📊 Setup Tests Summary: ${passedTests}/${totalTests} passed`);

  if (passedTests === totalTests) {
    console.log('🎉 All individual setup tests passed!');
  } else {
    console.log('⚠️ Some setup tests failed - check logs above for details');
  }

  return {
    summary: { passed: passedTests, total: totalTests },
    results: results
  };
}
