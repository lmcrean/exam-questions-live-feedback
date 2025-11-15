/**
 * Authentication Workflow Scenarios for Development Testing
 *
 * Tests authentication flows using granular utility functions for sqlite localhost
 */

import type { APIRequestContext, Expect } from '@playwright/test';
import { generateTestUser, type TestUserData } from '../auth/generateTestUser.js';
import { registerUser, type RegistrationResult } from '../auth/registerUser.js';
import { loginUser } from '../auth/loginUser.js';
import { verifyToken } from '../auth/verifyToken.js';

interface AuthWorkflowResult {
  success: boolean;
  testUser: TestUserData;
  userId: string;
  authToken: string;
  verification: boolean;
}

interface AuthErrorTestResult {
  success: boolean;
}

/**
 * Complete authentication workflow test
 * Tests user registration, login, and token verification
 */
export async function runAuthWorkflow(
  request: APIRequestContext,
  expect: Expect
): Promise<AuthWorkflowResult> {
  console.log('🔐 Starting Auth Workflow...');

  try {
    // Step 1: Generate test user data
    const testUser = generateTestUser();
    console.log('✅ Generated test user data');

    // Step 2: Register the user
    const registrationResult: RegistrationResult = await registerUser(request, testUser);
    console.log('✅ User registered successfully');

    // Step 3: Login with the registered user
    const authToken = await loginUser(request, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ User logged in successfully');

    // Step 4: Verify the token
    const tokenVerification = await verifyToken(request, authToken);
    console.log('✅ Token verified successfully');

    console.log('🎉 Auth Workflow completed successfully!');
    return {
      success: true,
      testUser: testUser,
      userId: registrationResult.userId,
      authToken: authToken,
      verification: tokenVerification
    };

  } catch (error) {
    console.error('❌ Auth Workflow failed:', (error as Error).message);
    throw error;
  }
}

/**
 * Authentication error scenarios test
 * Tests various authentication failure cases
 */
export async function runAuthErrorTest(
  request: APIRequestContext,
  expect: Expect
): Promise<AuthErrorTestResult> {
  console.log('🔐 Starting Auth Error Tests...');

  try {
    // Test 1: Login with invalid credentials
    try {
      await loginUser(request, {
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      });
      throw new Error('Login should have failed');
    } catch (error) {
      if ((error as Error).message.includes('Login should have failed')) {
        throw error;
      }
      console.log('✅ Invalid login correctly rejected');
    }

    // Test 2: Verify invalid token
    try {
      await verifyToken(request, 'invalid-token-123');
      throw new Error('Token verification should have failed');
    } catch (error) {
      if ((error as Error).message.includes('Token verification should have failed')) {
        throw error;
      }
      console.log('✅ Invalid token correctly rejected');
    }

    console.log('🎉 Auth Error Tests completed successfully!');
    return { success: true };

  } catch (error) {
    console.error('❌ Auth Error Tests failed:', (error as Error).message);
    throw error;
  }
}
